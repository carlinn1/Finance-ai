package httpapi

import (
	"bytes"
	"crypto/sha256"
	"encoding/csv"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type importRow struct {
	Date        string  `json:"date"`
	Description string  `json:"description"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Fingerprint string  `json:"fingerprint"`
}

func (s *Server) createImport(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeError(w, 413, "file_too_large", "O arquivo deve ter no maximo 10 MB")
		return
	}
	accountID := r.FormValue("account_id")
	var exists bool
	if err := s.db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM financial_accounts WHERE id=$1 AND user_id=$2 AND status='active' AND deleted_at IS NULL)`, accountID, userID(r)).Scan(&exists); err != nil || !exists {
		writeError(w, 422, "invalid_account", "Selecione uma conta ativa")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, 422, "file_required", "Selecione um arquivo CSV")
		return
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".csv" {
		writeError(w, 422, "unsupported_file", "Nesta versao da interface, importe extratos CSV")
		return
	}
	rows, err := parseCSV(file, userID(r), accountID)
	if err != nil {
		writeError(w, 422, "invalid_csv", err.Error())
		return
	}
	if len(rows) == 0 {
		writeError(w, 422, "empty_file", "Nenhuma transacao valida foi encontrada")
		return
	}
	preview, err := json.Marshal(rows)
	if err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel processar o arquivo")
		return
	}
	var id string
	err = s.db.QueryRow(r.Context(), `INSERT INTO imports(user_id,account_id,file_name,file_type,status,total_records,preview_data) VALUES($1,$2,$3,'csv','preview',$4,$5) RETURNING id`, userID(r), accountID, header.Filename, len(rows), preview).Scan(&id)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 201, map[string]any{"id": id, "file_name": header.Filename, "total_records": len(rows), "items": rows})
}

func parseCSV(reader io.Reader, uid, accountID string) ([]importRow, error) {
	data, err := io.ReadAll(reader)
	if err != nil {
		return nil, fmt.Errorf("nao foi possivel ler o CSV")
	}
	parser := csv.NewReader(bytes.NewReader(data))
	firstLine := data
	if index := bytes.IndexByte(data, '\n'); index >= 0 {
		firstLine = data[:index]
	}
	if bytes.Count(firstLine, []byte(";")) > bytes.Count(firstLine, []byte(",")) {
		parser.Comma = ';'
	}
	records, err := parser.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("CSV invalido: %w", err)
	}
	if len(records) < 2 {
		return nil, fmt.Errorf("o CSV precisa de cabecalho e ao menos uma linha")
	}
	indexes := map[string]int{}
	for i, value := range records[0] {
		key := normalizeHeader(value)
		indexes[key] = i
	}
	dateIndex, okDate := firstIndex(indexes, "data", "date", "transactiondate")
	descriptionIndex, okDescription := firstIndex(indexes, "descricao", "description", "historico", "memo")
	amountIndex, okAmount := firstIndex(indexes, "valor", "amount", "value")
	if !okDate || !okDescription || !okAmount {
		return nil, fmt.Errorf("use colunas Data, Descricao e Valor")
	}
	items := make([]importRow, 0, len(records)-1)
	for line, record := range records[1:] {
		if dateIndex >= len(record) || descriptionIndex >= len(record) || amountIndex >= len(record) {
			continue
		}
		date, err := parseImportDate(strings.TrimSpace(record[dateIndex]))
		if err != nil {
			return nil, fmt.Errorf("data invalida na linha %d", line+2)
		}
		description := strings.TrimSpace(record[descriptionIndex])
		amount, err := parseImportAmount(record[amountIndex])
		if err != nil || amount == 0 || description == "" {
			return nil, fmt.Errorf("valor ou descricao invalida na linha %d", line+2)
		}
		kind := "income"
		if amount < 0 {
			kind = "expense"
			amount = -amount
		}
		raw := fmt.Sprintf("%s|%s|%s|%.2f|%s", uid, accountID, date, amount, strings.ToLower(description))
		sum := sha256.Sum256([]byte(raw))
		items = append(items, importRow{Date: date, Description: description, Type: kind, Amount: amount, Fingerprint: hex.EncodeToString(sum[:])})
	}
	return items, nil
}
func normalizeHeader(v string) string {
	replacer := strings.NewReplacer("á", "a", "à", "a", "ã", "a", "â", "a", "é", "e", "ê", "e", "í", "i", "ó", "o", "õ", "o", "ô", "o", "ú", "u", "ç", "c", "_", "", " ", "")
	return replacer.Replace(strings.ToLower(strings.TrimSpace(v)))
}
func firstIndex(values map[string]int, keys ...string) (int, bool) {
	for _, key := range keys {
		if index, ok := values[key]; ok {
			return index, true
		}
	}
	return 0, false
}
func parseImportDate(v string) (string, error) {
	for _, layout := range []string{"2006-01-02", "02/01/2006", "01/02/2006"} {
		if parsed, err := time.Parse(layout, v); err == nil {
			return parsed.Format("2006-01-02"), nil
		}
	}
	return "", fmt.Errorf("data invalida")
}
func parseImportAmount(v string) (float64, error) {
	value := strings.TrimSpace(strings.ReplaceAll(v, "R$", ""))
	if strings.Contains(value, ",") {
		value = strings.ReplaceAll(value, ".", "")
		value = strings.ReplaceAll(value, ",", ".")
	}
	return strconv.ParseFloat(value, 64)
}

func (s *Server) listImports(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,file_name,file_type,status,total_records,imported_records,duplicated_records,created_at FROM imports WHERE user_id=$1 ORDER BY created_at DESC`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, name, fileType, status string
		var total, imported, duplicated int
		var created time.Time
		if err = rows.Scan(&id, &name, &fileType, &status, &total, &imported, &duplicated, &created); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "file_name": name, "file_type": fileType, "status": status, "total_records": total, "imported_records": imported, "duplicated_records": duplicated, "created_at": created})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}
func (s *Server) importPreview(w http.ResponseWriter, r *http.Request) {
	var data []byte
	var name, status string
	if err := s.db.QueryRow(r.Context(), `SELECT preview_data,file_name,status FROM imports WHERE id=$1 AND user_id=$2`, r.PathValue("id"), userID(r)).Scan(&data, &name, &status); err != nil {
		dbError(w, err)
		return
	}
	var items []importRow
	if err := json.Unmarshal(data, &items); err != nil {
		writeError(w, 500, "invalid_preview", "Previa indisponivel")
		return
	}
	writeJSON(w, 200, map[string]any{"id": r.PathValue("id"), "file_name": name, "status": status, "items": items})
}
func (s *Server) confirmImport(w http.ResponseWriter, r *http.Request) {
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var accountID, status string
	var data []byte
	err = tx.QueryRow(r.Context(), `SELECT account_id,status,preview_data FROM imports WHERE id=$1 AND user_id=$2 FOR UPDATE`, r.PathValue("id"), userID(r)).Scan(&accountID, &status, &data)
	if err != nil {
		dbError(w, err)
		return
	}
	if status != "preview" {
		writeError(w, 409, "already_processed", "Esta importacao ja foi processada")
		return
	}
	var items []importRow
	if err = json.Unmarshal(data, &items); err != nil {
		writeError(w, 500, "invalid_preview", "Previa indisponivel")
		return
	}
	imported, duplicated := 0, 0
	for _, item := range items {
		var id string
		err = tx.QueryRow(r.Context(), `INSERT INTO transactions(user_id,account_id,type,amount,transaction_date,description,import_fingerprint) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING RETURNING id`, userID(r), accountID, item.Type, item.Amount, item.Date, item.Description, item.Fingerprint).Scan(&id)
		if err == pgx.ErrNoRows {
			duplicated++
			continue
		}
		if err != nil {
			dbError(w, err)
			return
		}
		if _, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, transactionDelta(item.Type, item.Amount), accountID); err != nil {
			dbError(w, err)
			return
		}
		imported++
	}
	if _, err = tx.Exec(r.Context(), `UPDATE imports SET status='confirmed',imported_records=$1,duplicated_records=$2 WHERE id=$3`, imported, duplicated, r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]int{"imported_records": imported, "duplicated_records": duplicated})
}
func (s *Server) deleteImport(w http.ResponseWriter, r *http.Request) {
	tag, err := s.db.Exec(r.Context(), `UPDATE imports SET status='cancelled' WHERE id=$1 AND user_id=$2 AND status IN ('pending','preview')`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Importacao pendente nao encontrada")
		return
	}
	w.WriteHeader(204)
}
