package httpapi

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type accountResponse struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	Institution    string  `json:"institution"`
	Currency       string  `json:"currency"`
	InitialBalance float64 `json:"initial_balance"`
	CurrentBalance float64 `json:"current_balance"`
	Status         string  `json:"status"`
}
type categoryResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	IsDefault bool   `json:"is_default"`
}
type transactionResponse struct {
	ID          string    `json:"id"`
	Description string    `json:"description"`
	Type        string    `json:"type"`
	Amount      float64   `json:"amount"`
	Value       float64   `json:"value"`
	Date        string    `json:"date"`
	AccountID   string    `json:"account_id"`
	Account     string    `json:"account"`
	CategoryID  *string   `json:"category_id"`
	Category    string    `json:"category"`
	CreatedAt   time.Time `json:"created_at"`
}

func (s *Server) listAccounts(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,name,type,institution,currency,initial_balance,current_balance,status FROM financial_accounts WHERE user_id=$1 AND deleted_at IS NULL ORDER BY status,name`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []accountResponse{}
	for rows.Next() {
		var item accountResponse
		if err = rows.Scan(&item.ID, &item.Name, &item.Type, &item.Institution, &item.Currency, &item.InitialBalance, &item.CurrentBalance, &item.Status); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, item)
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (s *Server) createAccount(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name           string  `json:"name"`
		Type           string  `json:"type"`
		Institution    string  `json:"institution"`
		Currency       string  `json:"currency"`
		InitialBalance float64 `json:"initial_balance"`
	}
	if decodeJSON(r, &in) != nil || strings.TrimSpace(in.Name) == "" || !validAccountType(in.Type) {
		writeError(w, 422, "validation_error", "Dados da conta invalidos")
		return
	}
	if in.Currency == "" {
		in.Currency = "BRL"
	}
	var item accountResponse
	err := s.db.QueryRow(r.Context(), `INSERT INTO financial_accounts(user_id,name,type,institution,currency,initial_balance,current_balance) VALUES($1,$2,$3,$4,UPPER($5),$6,$6) RETURNING id,name,type,institution,currency,initial_balance,current_balance,status`, userID(r), strings.TrimSpace(in.Name), in.Type, strings.TrimSpace(in.Institution), in.Currency, in.InitialBalance).Scan(&item.ID, &item.Name, &item.Type, &item.Institution, &item.Currency, &item.InitialBalance, &item.CurrentBalance, &item.Status)
	if err != nil {
		if strings.Contains(err.Error(), "financial_accounts_user_id_name_key") {
			writeError(w, 409, "duplicate_account", "Ja existe uma conta com este nome")
			return
		}
		dbError(w, err)
		return
	}
	writeJSON(w, 201, item)
}
func validAccountType(v string) bool {
	return v == "checking" || v == "savings" || v == "wallet" || v == "credit_card" || v == "investment"
}

func (s *Server) getAccount(w http.ResponseWriter, r *http.Request) {
	var item accountResponse
	err := s.db.QueryRow(r.Context(), `SELECT id,name,type,institution,currency,initial_balance,current_balance,status FROM financial_accounts WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r)).Scan(&item.ID, &item.Name, &item.Type, &item.Institution, &item.Currency, &item.InitialBalance, &item.CurrentBalance, &item.Status)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, item)
}

func (s *Server) updateAccount(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name        string `json:"name"`
		Type        string `json:"type"`
		Institution string `json:"institution"`
		Currency    string `json:"currency"`
		Status      string `json:"status"`
	}
	if decodeJSON(r, &in) != nil || strings.TrimSpace(in.Name) == "" || !validAccountType(in.Type) || (in.Status != "active" && in.Status != "archived") {
		writeError(w, 422, "validation_error", "Dados da conta invalidos")
		return
	}
	tag, err := s.db.Exec(r.Context(), `UPDATE financial_accounts SET name=$1,type=$2,institution=$3,currency=UPPER($4),status=$5 WHERE id=$6 AND user_id=$7 AND deleted_at IS NULL`, in.Name, in.Type, in.Institution, in.Currency, in.Status, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Conta nao encontrada")
		return
	}
	s.getAccount(w, r)
}

func (s *Server) deleteAccount(w http.ResponseWriter, r *http.Request) {
	var count int
	if err := s.db.QueryRow(r.Context(), `SELECT COUNT(*) FROM transactions WHERE account_id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r)).Scan(&count); err != nil {
		dbError(w, err)
		return
	}
	if count > 0 {
		tag, err := s.db.Exec(r.Context(), `UPDATE financial_accounts SET status='archived' WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r))
		if err != nil {
			dbError(w, err)
			return
		}
		if tag.RowsAffected() == 0 {
			writeError(w, 404, "not_found", "Conta nao encontrada")
			return
		}
	} else {
		tag, err := s.db.Exec(r.Context(), `UPDATE financial_accounts SET deleted_at=NOW() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r))
		if err != nil {
			dbError(w, err)
			return
		}
		if tag.RowsAffected() == 0 {
			writeError(w, 404, "not_found", "Conta nao encontrada")
			return
		}
	}
	w.WriteHeader(204)
}

func (s *Server) accountStatement(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	clone := r.Clone(r.Context())
	values := clone.URL.Query()
	values.Set("account_id", r.PathValue("id"))
	if query.Get("start_date") != "" {
		values.Set("start_date", query.Get("start_date"))
	}
	if query.Get("end_date") != "" {
		values.Set("end_date", query.Get("end_date"))
	}
	clone.URL.RawQuery = values.Encode()
	s.listTransactions(w, clone)
}

func (s *Server) reconcileAccount(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Balance     float64 `json:"balance"`
		Date        string  `json:"date"`
		Description string  `json:"description"`
	}
	if decodeJSON(r, &in) != nil {
		writeError(w, 400, "invalid_request", "Saldo invalido")
		return
	}
	if in.Date == "" {
		in.Date = time.Now().Format("2006-01-02")
	}
	if in.Description == "" {
		in.Description = "Conciliacao de saldo"
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var current float64
	err = tx.QueryRow(r.Context(), `SELECT current_balance FROM financial_accounts WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL FOR UPDATE`, r.PathValue("id"), userID(r)).Scan(&current)
	if err != nil {
		dbError(w, err)
		return
	}
	delta := in.Balance - current
	if delta == 0 {
		writeJSON(w, 200, map[string]any{"balance": current})
		return
	}
	kind := "income"
	if delta < 0 {
		kind = "expense"
		delta = -delta
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO transactions(user_id,account_id,type,amount,transaction_date,description) VALUES($1,$2,$3,$4,$5,$6)`, userID(r), r.PathValue("id"), kind, delta, in.Date, in.Description)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, transactionDelta(kind, delta), r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"balance": in.Balance})
}

func (s *Server) listCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,name,type,icon,color,is_default FROM categories WHERE (user_id=$1 OR user_id IS NULL) AND deleted_at IS NULL ORDER BY is_default DESC,name`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []categoryResponse{}
	for rows.Next() {
		var item categoryResponse
		if err = rows.Scan(&item.ID, &item.Name, &item.Type, &item.Icon, &item.Color, &item.IsDefault); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, item)
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (s *Server) createCategory(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name  string `json:"name"`
		Type  string `json:"type"`
		Icon  string `json:"icon"`
		Color string `json:"color"`
	}
	if decodeJSON(r, &in) != nil || strings.TrimSpace(in.Name) == "" || !validCategoryType(in.Type) {
		writeError(w, 422, "validation_error", "Dados da categoria invalidos")
		return
	}
	if in.Color == "" {
		in.Color = "#94A3B8"
	}
	var item categoryResponse
	err := s.db.QueryRow(r.Context(), `INSERT INTO categories(user_id,name,type,icon,color) VALUES($1,$2,$3,$4,$5) RETURNING id,name,type,icon,color,is_default`, userID(r), strings.TrimSpace(in.Name), in.Type, in.Icon, in.Color).Scan(&item.ID, &item.Name, &item.Type, &item.Icon, &item.Color, &item.IsDefault)
	if err != nil {
		if strings.Contains(err.Error(), "categories_user_name_unique") {
			writeError(w, 409, "duplicate_category", "Categoria ja cadastrada")
			return
		}
		dbError(w, err)
		return
	}
	writeJSON(w, 201, item)
}
func validCategoryType(v string) bool { return v == "income" || v == "expense" || v == "both" }
func (s *Server) updateCategory(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name  string `json:"name"`
		Type  string `json:"type"`
		Icon  string `json:"icon"`
		Color string `json:"color"`
	}
	if decodeJSON(r, &in) != nil || strings.TrimSpace(in.Name) == "" || !validCategoryType(in.Type) {
		writeError(w, 422, "validation_error", "Dados invalidos")
		return
	}
	tag, err := s.db.Exec(r.Context(), `UPDATE categories SET name=$1,type=$2,icon=$3,color=$4 WHERE id=$5 AND user_id=$6 AND deleted_at IS NULL`, in.Name, in.Type, in.Icon, in.Color, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Categoria personalizada nao encontrada")
		return
	}
	w.WriteHeader(204)
}
func (s *Server) deleteCategory(w http.ResponseWriter, r *http.Request) {
	tag, err := s.db.Exec(r.Context(), `UPDATE categories SET deleted_at=NOW() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Categoria personalizada nao encontrada")
		return
	}
	w.WriteHeader(204)
}

type transactionInput struct {
	AccountID   string  `json:"account_id"`
	CategoryID  *string `json:"category_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Date        string  `json:"date"`
	Description string  `json:"description"`
	IsRecurring bool    `json:"is_recurring"`
}

func validTransactionInput(in transactionInput) bool {
	_, err := time.Parse("2006-01-02", in.Date)
	return err == nil && in.AccountID != "" && strings.TrimSpace(in.Description) != "" && in.Amount > 0 && (in.Type == "income" || in.Type == "expense")
}
func transactionDelta(kind string, amount float64) float64 {
	if kind == "expense" {
		return -amount
	}
	return amount
}

func scanTransaction(row pgx.Row) (transactionResponse, error) {
	var item transactionResponse
	err := row.Scan(&item.ID, &item.Description, &item.Type, &item.Amount, &item.Value, &item.Date, &item.AccountID, &item.Account, &item.CategoryID, &item.Category, &item.CreatedAt)
	return item, err
}

const transactionSelect = `SELECT t.id,t.description,t.type,t.amount,CASE WHEN t.type='expense' THEN -t.amount ELSE t.amount END,t.transaction_date::text,t.account_id,a.name,t.category_id,COALESCE(c.name,'Sem categoria'),t.created_at FROM transactions t JOIN financial_accounts a ON a.id=t.account_id LEFT JOIN categories c ON c.id=t.category_id`

func (s *Server) listTransactions(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	args := []any{userID(r)}
	where := []string{"t.user_id=$1", "t.deleted_at IS NULL"}
	add := func(condition string, value any) {
		args = append(args, value)
		where = append(where, strings.ReplaceAll(condition, "?", "$"+strconv.Itoa(len(args))))
	}
	if v := q.Get("start_date"); v != "" {
		add("t.transaction_date>=?", v)
	}
	if v := q.Get("end_date"); v != "" {
		add("t.transaction_date<=?", v)
	}
	if v := q.Get("account_id"); v != "" {
		add("t.account_id=?", v)
	}
	if v := q.Get("category_id"); v != "" {
		add("t.category_id=?", v)
	}
	if v := q.Get("type"); v != "" {
		add("t.type=?", v)
	}
	if v := q.Get("search"); v != "" {
		add("t.description ILIKE '%'||?||'%'", v)
	}
	if v := q.Get("min_amount"); v != "" {
		add("t.amount>=?", v)
	}
	if v := q.Get("max_amount"); v != "" {
		add("t.amount<=?", v)
	}
	rows, err := s.db.Query(r.Context(), transactionSelect+" WHERE "+strings.Join(where, " AND ")+" ORDER BY t.transaction_date DESC,t.created_at DESC LIMIT 500", args...)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []transactionResponse{}
	var income, expense float64
	for rows.Next() {
		item, err := scanTransaction(rows)
		if err != nil {
			dbError(w, err)
			return
		}
		items = append(items, item)
		if item.Type == "income" {
			income += item.Amount
		} else if item.Type == "expense" {
			expense += item.Amount
		}
	}
	writeJSON(w, 200, map[string]any{"items": items, "summary": map[string]float64{"income": income, "expense": expense, "result": income - expense}})
}

func (s *Server) createTransaction(w http.ResponseWriter, r *http.Request) {
	var in transactionInput
	if decodeJSON(r, &in) != nil || !validTransactionInput(in) {
		writeError(w, 422, "validation_error", "Dados da transacao invalidos")
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	if err = validateReferences(r, tx, userID(r), in.AccountID, in.CategoryID); err != nil {
		writeError(w, 422, "invalid_reference", err.Error())
		return
	}
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO transactions(user_id,account_id,category_id,type,amount,transaction_date,description,is_recurring) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, userID(r), in.AccountID, in.CategoryID, in.Type, in.Amount, in.Date, strings.TrimSpace(in.Description), in.IsRecurring).Scan(&id)
	if err != nil {
		dbError(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, transactionDelta(in.Type, in.Amount), in.AccountID)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `INSERT INTO transaction_audit_logs(transaction_id,user_id,action,new_data) SELECT id,user_id,'created',to_jsonb(transactions) FROM transactions WHERE id=$1`, id); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	r.SetPathValue("id", id)
	s.getTransaction(w, r)
}

func validateReferences(r *http.Request, tx pgx.Tx, uid, accountID string, categoryID *string) error {
	var ok bool
	if err := tx.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM financial_accounts WHERE id=$1 AND user_id=$2 AND status='active' AND deleted_at IS NULL)`, accountID, uid).Scan(&ok); err != nil || !ok {
		return &validationError{"Conta invalida ou arquivada"}
	}
	if categoryID != nil && *categoryID != "" {
		if err := tx.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM categories WHERE id=$1 AND (user_id=$2 OR user_id IS NULL) AND deleted_at IS NULL)`, *categoryID, uid).Scan(&ok); err != nil || !ok {
			return &validationError{"Categoria invalida"}
		}
	}
	return nil
}

type validationError struct{ message string }

func (e *validationError) Error() string { return e.message }

func (s *Server) getTransaction(w http.ResponseWriter, r *http.Request) {
	item, err := scanTransaction(s.db.QueryRow(r.Context(), transactionSelect+` WHERE t.id=$1 AND t.user_id=$2 AND t.deleted_at IS NULL`, r.PathValue("id"), userID(r)))
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, item)
}

func (s *Server) updateTransaction(w http.ResponseWriter, r *http.Request) {
	var in transactionInput
	if decodeJSON(r, &in) != nil || !validTransactionInput(in) {
		writeError(w, 422, "validation_error", "Dados invalidos")
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var oldAccount, oldType string
	var oldAmount float64
	var oldData []byte
	err = tx.QueryRow(r.Context(), `SELECT account_id,type,amount,to_jsonb(t) FROM transactions t WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL FOR UPDATE`, r.PathValue("id"), userID(r)).Scan(&oldAccount, &oldType, &oldAmount, &oldData)
	if err != nil {
		dbError(w, err)
		return
	}
	if err = validateReferences(r, tx, userID(r), in.AccountID, in.CategoryID); err != nil {
		writeError(w, 422, "invalid_reference", err.Error())
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance-$1 WHERE id=$2`, transactionDelta(oldType, oldAmount), oldAccount)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, transactionDelta(in.Type, in.Amount), in.AccountID); err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE transactions SET account_id=$1,category_id=$2,type=$3,amount=$4,transaction_date=$5,description=$6,is_recurring=$7 WHERE id=$8`, in.AccountID, in.CategoryID, in.Type, in.Amount, in.Date, strings.TrimSpace(in.Description), in.IsRecurring, r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	var newData []byte
	_ = tx.QueryRow(r.Context(), `SELECT to_jsonb(t) FROM transactions t WHERE id=$1`, r.PathValue("id")).Scan(&newData)
	_, err = tx.Exec(r.Context(), `INSERT INTO transaction_audit_logs(transaction_id,user_id,action,old_data,new_data) VALUES($1,$2,'updated',$3,$4)`, r.PathValue("id"), userID(r), json.RawMessage(oldData), json.RawMessage(newData))
	if err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	s.getTransaction(w, r)
}

func (s *Server) deleteTransaction(w http.ResponseWriter, r *http.Request) {
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var account, kind string
	var amount float64
	var oldData []byte
	err = tx.QueryRow(r.Context(), `SELECT account_id,type,amount,to_jsonb(t) FROM transactions t WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL FOR UPDATE`, r.PathValue("id"), userID(r)).Scan(&account, &kind, &amount, &oldData)
	if err != nil {
		dbError(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance-$1 WHERE id=$2`, transactionDelta(kind, amount), account)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE transactions SET deleted_at=NOW() WHERE id=$1`, r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `INSERT INTO transaction_audit_logs(transaction_id,user_id,action,old_data) VALUES($1,$2,'deleted',$3)`, r.PathValue("id"), userID(r), json.RawMessage(oldData)); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	w.WriteHeader(204)
}

func (s *Server) duplicateTransaction(w http.ResponseWriter, r *http.Request) {
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id, account, kind string
	var amount float64
	err = tx.QueryRow(r.Context(), `INSERT INTO transactions(user_id,account_id,category_id,contact_id,type,amount,transaction_date,description,is_recurring) SELECT user_id,account_id,category_id,contact_id,type,amount,CURRENT_DATE,description||' (copia)',FALSE FROM transactions WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING id,account_id,type,amount`, r.PathValue("id"), userID(r)).Scan(&id, &account, &kind, &amount)
	if err != nil {
		dbError(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, transactionDelta(kind, amount), account)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `INSERT INTO transaction_audit_logs(transaction_id,user_id,action,new_data) SELECT id,user_id,'created',to_jsonb(transactions) FROM transactions WHERE id=$1`, id); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	r.SetPathValue("id", id)
	s.getTransaction(w, r)
}

func (s *Server) transactionAudit(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,action,old_data,new_data,created_at FROM transaction_audit_logs WHERE transaction_id=$1 AND user_id=$2 ORDER BY created_at DESC`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, action string
		var oldData, newData []byte
		var created time.Time
		if err = rows.Scan(&id, &action, &oldData, &newData, &created); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "action": action, "old_data": json.RawMessage(oldData), "new_data": json.RawMessage(newData), "created_at": created})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (s *Server) createTransfer(w http.ResponseWriter, r *http.Request) {
	var in struct {
		SourceAccountID      string  `json:"source_account_id"`
		DestinationAccountID string  `json:"destination_account_id"`
		Amount               float64 `json:"amount"`
		Date                 string  `json:"date"`
		Description          string  `json:"description"`
	}
	if decodeJSON(r, &in) != nil || in.SourceAccountID == in.DestinationAccountID || in.Amount <= 0 {
		writeError(w, 422, "validation_error", "Transferencia invalida")
		return
	}
	if in.Date == "" {
		in.Date = time.Now().Format("2006-01-02")
	}
	if in.Description == "" {
		in.Description = "Transferencia entre contas"
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var count int
	if err = tx.QueryRow(r.Context(), `SELECT COUNT(*) FROM financial_accounts WHERE id=ANY($1::uuid[]) AND user_id=$2 AND status='active' AND deleted_at IS NULL`, []string{in.SourceAccountID, in.DestinationAccountID}, userID(r)).Scan(&count); err != nil || count != 2 {
		writeError(w, 422, "invalid_reference", "Contas invalidas")
		return
	}
	group := newUUIDSQL(tx, r)
	if group == "" {
		writeError(w, 500, "internal_error", "Nao foi possivel transferir")
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO transactions(user_id,account_id,type,amount,transaction_date,description,transfer_group_id) VALUES($1,$2,'transfer',$4,$5,$6,$7),($1,$3,'transfer',$4,$5,$6,$7)`, userID(r), in.SourceAccountID, in.DestinationAccountID, in.Amount, in.Date, in.Description, group)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance-$1 WHERE id=$2`, in.Amount, in.SourceAccountID); err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, in.Amount, in.DestinationAccountID); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"transfer_group_id": group})
}
func newUUIDSQL(tx pgx.Tx, r *http.Request) string {
	var id string
	_ = tx.QueryRow(r.Context(), `SELECT gen_random_uuid()`).Scan(&id)
	return id
}
