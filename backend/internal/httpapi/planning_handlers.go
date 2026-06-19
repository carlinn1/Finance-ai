package httpapi

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type billResponse struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	PaidAmount  float64 `json:"paid_amount"`
	DueDate     string  `json:"due_date"`
	PaidAt      *string `json:"paid_at"`
	Status      string  `json:"status"`
	IsRecurring bool    `json:"is_recurring"`
	AccountID   *string `json:"account_id"`
	Account     string  `json:"account"`
	CategoryID  *string `json:"category_id"`
	Category    string  `json:"category"`
	Notes       string  `json:"notes"`
}

const billSelect = `SELECT b.id,b.description,b.type,b.amount,b.paid_amount,b.due_date::text,b.paid_at::text,CASE WHEN b.status='pending' AND b.due_date<CURRENT_DATE THEN 'overdue' ELSE b.status END,b.is_recurring,b.account_id,COALESCE(a.name,''),b.category_id,COALESCE(c.name,'Sem categoria'),COALESCE(b.notes,'') FROM bills b LEFT JOIN financial_accounts a ON a.id=b.account_id LEFT JOIN categories c ON c.id=b.category_id`

func scanBill(row pgx.Row) (billResponse, error) {
	var v billResponse
	err := row.Scan(&v.ID, &v.Description, &v.Type, &v.Amount, &v.PaidAmount, &v.DueDate, &v.PaidAt, &v.Status, &v.IsRecurring, &v.AccountID, &v.Account, &v.CategoryID, &v.Category, &v.Notes)
	return v, err
}

func (s *Server) listBills(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), billSelect+` WHERE b.user_id=$1 AND b.deleted_at IS NULL ORDER BY b.due_date,b.created_at`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []billResponse{}
	summary := map[string]float64{"payable": 0, "receivable": 0, "overdue": 0}
	for rows.Next() {
		v, err := scanBill(rows)
		if err != nil {
			dbError(w, err)
			return
		}
		items = append(items, v)
		remaining := v.Amount - v.PaidAmount
		if v.Status != "paid" {
			summary[v.Type] += remaining
		}
		if v.Status == "overdue" {
			summary["overdue"] += remaining
		}
	}
	summary["forecast"] = summary["receivable"] - summary["payable"]
	writeJSON(w, 200, map[string]any{"items": items, "summary": summary})
}

type billInput struct {
	AccountID   *string `json:"account_id"`
	CategoryID  *string `json:"category_id"`
	Type        string  `json:"type"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	DueDate     string  `json:"due_date"`
	IsRecurring bool    `json:"is_recurring"`
	Notes       string  `json:"notes"`
}

func validBill(in billInput) bool {
	_, err := time.Parse("2006-01-02", in.DueDate)
	return err == nil && strings.TrimSpace(in.Description) != "" && in.Amount > 0 && (in.Type == "payable" || in.Type == "receivable")
}
func (s *Server) createBill(w http.ResponseWriter, r *http.Request) {
	var in billInput
	if decodeJSON(r, &in) != nil || !validBill(in) {
		writeError(w, 422, "validation_error", "Dados da conta invalidos")
		return
	}
	if err := s.validateOptionalReferences(r, in.AccountID, in.CategoryID); err != nil {
		writeError(w, 422, "invalid_reference", err.Error())
		return
	}
	var id string
	err := s.db.QueryRow(r.Context(), `INSERT INTO bills(user_id,account_id,category_id,type,description,amount,due_date,is_recurring,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, userID(r), in.AccountID, in.CategoryID, in.Type, strings.TrimSpace(in.Description), in.Amount, in.DueDate, in.IsRecurring, in.Notes).Scan(&id)
	if err != nil {
		dbError(w, err)
		return
	}
	r.SetPathValue("id", id)
	s.getBill(w, r)
}
func (s *Server) getBill(w http.ResponseWriter, r *http.Request) {
	v, err := scanBill(s.db.QueryRow(r.Context(), billSelect+` WHERE b.id=$1 AND b.user_id=$2 AND b.deleted_at IS NULL`, r.PathValue("id"), userID(r)))
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, v)
}
func (s *Server) validateOptionalReferences(r *http.Request, accountID, categoryID *string) error {
	var ok bool
	if accountID != nil && *accountID != "" {
		if err := s.db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM financial_accounts WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL)`, *accountID, userID(r)).Scan(&ok); err != nil || !ok {
			return &validationError{"Conta invalida"}
		}
	}
	if categoryID != nil && *categoryID != "" {
		if err := s.db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM categories WHERE id=$1 AND (user_id=$2 OR user_id IS NULL) AND deleted_at IS NULL)`, *categoryID, userID(r)).Scan(&ok); err != nil || !ok {
			return &validationError{"Categoria invalida"}
		}
	}
	return nil
}
func (s *Server) updateBill(w http.ResponseWriter, r *http.Request) {
	var in billInput
	if decodeJSON(r, &in) != nil || !validBill(in) {
		writeError(w, 422, "validation_error", "Dados invalidos")
		return
	}
	if err := s.validateOptionalReferences(r, in.AccountID, in.CategoryID); err != nil {
		writeError(w, 422, "invalid_reference", err.Error())
		return
	}
	tag, err := s.db.Exec(r.Context(), `UPDATE bills SET account_id=$1,category_id=$2,type=$3,description=$4,amount=$5,due_date=$6,is_recurring=$7,notes=$8 WHERE id=$9 AND user_id=$10 AND deleted_at IS NULL`, in.AccountID, in.CategoryID, in.Type, in.Description, in.Amount, in.DueDate, in.IsRecurring, in.Notes, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Conta nao encontrada")
		return
	}
	s.getBill(w, r)
}
func (s *Server) deleteBill(w http.ResponseWriter, r *http.Request) {
	tag, err := s.db.Exec(r.Context(), `UPDATE bills SET deleted_at=NOW() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Conta nao encontrada")
		return
	}
	w.WriteHeader(204)
}
func (s *Server) payBill(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Amount float64 `json:"amount"`
		PaidAt string  `json:"paid_at"`
	}
	_ = decodeJSON(r, &in)
	s.settleBill(w, r, in.Amount, in.PaidAt, false)
}
func (s *Server) partialPayBill(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Amount float64 `json:"amount"`
		PaidAt string  `json:"paid_at"`
	}
	if decodeJSON(r, &in) != nil || in.Amount <= 0 {
		writeError(w, 422, "validation_error", "Valor do pagamento obrigatorio")
		return
	}
	s.settleBill(w, r, in.Amount, in.PaidAt, true)
}
func (s *Server) settleBill(w http.ResponseWriter, r *http.Request, requested float64, paidAt string, partial bool) {
	if paidAt == "" {
		paidAt = time.Now().Format("2006-01-02")
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var accountID, kind, description string
	var categoryID *string
	var total, already float64
	err = tx.QueryRow(r.Context(), `SELECT account_id,category_id,type,description,amount,paid_amount FROM bills WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL FOR UPDATE`, r.PathValue("id"), userID(r)).Scan(&accountID, &categoryID, &kind, &description, &total, &already)
	if err != nil {
		dbError(w, err)
		return
	}
	remaining := total - already
	if requested <= 0 {
		requested = remaining
	}
	if requested > remaining || (!partial && requested != remaining) {
		writeError(w, 422, "validation_error", "Valor de liquidacao invalido")
		return
	}
	txType := "expense"
	if kind == "receivable" {
		txType = "income"
	}
	var transactionID string
	err = tx.QueryRow(r.Context(), `INSERT INTO transactions(user_id,account_id,category_id,type,amount,transaction_date,description) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`, userID(r), accountID, categoryID, txType, requested, paidAt, description).Scan(&transactionID)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE financial_accounts SET current_balance=current_balance+$1 WHERE id=$2`, transactionDelta(txType, requested), accountID); err != nil {
		dbError(w, err)
		return
	}
	status := "partial"
	if requested == remaining {
		status = "paid"
	}
	if _, err = tx.Exec(r.Context(), `UPDATE bills SET paid_amount=paid_amount+$1,paid_at=$2,status=$3 WHERE id=$4`, requested, paidAt, status, r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	s.getBill(w, r)
}

type budgetResponse struct {
	ID          string  `json:"id"`
	CategoryID  string  `json:"category_id"`
	Category    string  `json:"category"`
	Month       int     `json:"month"`
	Year        int     `json:"year"`
	Limit       float64 `json:"limit"`
	Spent       float64 `json:"spent"`
	IsRecurring bool    `json:"is_recurring"`
}

func (s *Server) listBudgets(w http.ResponseWriter, r *http.Request) {
	month, year := period(r)
	rows, err := s.db.Query(r.Context(), `SELECT b.id,b.category_id,c.name,b.month,b.year,b.limit_amount,COALESCE(SUM(t.amount) FILTER(WHERE t.type='expense'),0),b.is_recurring FROM budgets b JOIN categories c ON c.id=b.category_id LEFT JOIN transactions t ON t.user_id=b.user_id AND t.category_id=b.category_id AND t.deleted_at IS NULL AND EXTRACT(MONTH FROM t.transaction_date)=b.month AND EXTRACT(YEAR FROM t.transaction_date)=b.year WHERE b.user_id=$1 AND b.month=$2 AND b.year=$3 GROUP BY b.id,c.name ORDER BY c.name`, userID(r), month, year)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []budgetResponse{}
	var limit, spent float64
	for rows.Next() {
		var v budgetResponse
		if err = rows.Scan(&v.ID, &v.CategoryID, &v.Category, &v.Month, &v.Year, &v.Limit, &v.Spent, &v.IsRecurring); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, v)
		limit += v.Limit
		spent += v.Spent
	}
	writeJSON(w, 200, map[string]any{"items": items, "summary": map[string]float64{"limit": limit, "spent": spent, "remaining": limit - spent}})
}
func period(r *http.Request) (int, int) {
	now := time.Now()
	month, year := int(now.Month()), now.Year()
	if v := r.URL.Query().Get("month"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed >= 1 && parsed <= 12 {
			month = parsed
		}
	}
	if v := r.URL.Query().Get("year"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed >= 2000 && parsed <= 2200 {
			year = parsed
		}
	}
	return month, year
}
func (s *Server) upsertBudget(w http.ResponseWriter, r *http.Request) {
	var in struct {
		CategoryID  string  `json:"category_id"`
		Month       int     `json:"month"`
		Year        int     `json:"year"`
		Limit       float64 `json:"limit"`
		IsRecurring bool    `json:"is_recurring"`
	}
	if decodeJSON(r, &in) != nil || in.CategoryID == "" || in.Month < 1 || in.Month > 12 || in.Year < 2000 || in.Limit <= 0 {
		writeError(w, 422, "validation_error", "Dados do orcamento invalidos")
		return
	}
	var id string
	err := s.db.QueryRow(r.Context(), `INSERT INTO budgets(user_id,category_id,month,year,limit_amount,is_recurring) SELECT $1,$2,$3,$4,$5,$6 WHERE EXISTS(SELECT 1 FROM categories WHERE id=$2 AND (user_id=$1 OR user_id IS NULL) AND deleted_at IS NULL) ON CONFLICT(user_id,category_id,month,year) DO UPDATE SET limit_amount=EXCLUDED.limit_amount,is_recurring=EXCLUDED.is_recurring RETURNING id`, userID(r), in.CategoryID, in.Month, in.Year, in.Limit, in.IsRecurring).Scan(&id)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]string{"id": id})
}
func (s *Server) updateBudget(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Limit       float64 `json:"limit"`
		IsRecurring bool    `json:"is_recurring"`
	}
	if decodeJSON(r, &in) != nil || in.Limit <= 0 {
		writeError(w, 422, "validation_error", "Limite invalido")
		return
	}
	tag, err := s.db.Exec(r.Context(), `UPDATE budgets SET limit_amount=$1,is_recurring=$2 WHERE id=$3 AND user_id=$4`, in.Limit, in.IsRecurring, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Orcamento nao encontrado")
		return
	}
	w.WriteHeader(204)
}
func (s *Server) deleteBudget(w http.ResponseWriter, r *http.Request) {
	tag, err := s.db.Exec(r.Context(), `DELETE FROM budgets WHERE id=$1 AND user_id=$2`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Orcamento nao encontrado")
		return
	}
	w.WriteHeader(204)
}

type goalResponse struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Target      float64 `json:"target"`
	Saved       float64 `json:"saved"`
	Deadline    string  `json:"deadline"`
	Description string  `json:"description"`
	Monthly     float64 `json:"monthly"`
	Status      string  `json:"status"`
	AccountID   *string `json:"account_id"`
}

func (s *Server) listGoals(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,name,target_amount,current_amount,deadline::text,COALESCE(description,''),monthly_contribution,CASE WHEN current_amount>=target_amount THEN 'completed' ELSE status END,account_id FROM financial_goals WHERE user_id=$1 AND deleted_at IS NULL ORDER BY status,deadline`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []goalResponse{}
	for rows.Next() {
		var v goalResponse
		if err = rows.Scan(&v.ID, &v.Name, &v.Target, &v.Saved, &v.Deadline, &v.Description, &v.Monthly, &v.Status, &v.AccountID); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, v)
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

type goalInput struct {
	AccountID   *string `json:"account_id"`
	Name        string  `json:"name"`
	Target      float64 `json:"target"`
	Saved       float64 `json:"saved"`
	Deadline    string  `json:"deadline"`
	Description string  `json:"description"`
	Monthly     float64 `json:"monthly"`
}

func validGoal(v goalInput) bool {
	_, err := time.Parse("2006-01-02", v.Deadline)
	return err == nil && strings.TrimSpace(v.Name) != "" && v.Target > 0 && v.Saved >= 0
}
func (s *Server) createGoal(w http.ResponseWriter, r *http.Request) {
	var in goalInput
	if decodeJSON(r, &in) != nil || !validGoal(in) {
		writeError(w, 422, "validation_error", "Dados da meta invalidos")
		return
	}
	if err := s.validateOptionalReferences(r, in.AccountID, nil); err != nil {
		writeError(w, 422, "invalid_reference", err.Error())
		return
	}
	var id string
	err := s.db.QueryRow(r.Context(), `INSERT INTO financial_goals(user_id,account_id,name,target_amount,current_amount,deadline,description,monthly_contribution,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $5 >= $4 THEN 'completed' ELSE 'active' END) RETURNING id`, userID(r), in.AccountID, strings.TrimSpace(in.Name), in.Target, in.Saved, in.Deadline, in.Description, in.Monthly).Scan(&id)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (s *Server) updateGoal(w http.ResponseWriter, r *http.Request) {
	var in goalInput
	if decodeJSON(r, &in) != nil || !validGoal(in) {
		writeError(w, 422, "validation_error", "Dados invalidos")
		return
	}
	tag, err := s.db.Exec(r.Context(), `UPDATE financial_goals SET account_id=$1,name=$2,target_amount=$3,current_amount=$4,deadline=$5,description=$6,monthly_contribution=$7,status=CASE WHEN $4 >= $3 THEN 'completed' ELSE 'active' END WHERE id=$8 AND user_id=$9 AND deleted_at IS NULL`, in.AccountID, in.Name, in.Target, in.Saved, in.Deadline, in.Description, in.Monthly, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Meta nao encontrada")
		return
	}
	w.WriteHeader(204)
}
func (s *Server) deleteGoal(w http.ResponseWriter, r *http.Request) {
	tag, err := s.db.Exec(r.Context(), `UPDATE financial_goals SET deleted_at=NOW() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Meta nao encontrada")
		return
	}
	w.WriteHeader(204)
}
func (s *Server) addGoalContribution(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Amount float64 `json:"amount"`
		Date   string  `json:"date"`
	}
	if decodeJSON(r, &in) != nil || in.Amount <= 0 {
		writeError(w, 422, "validation_error", "Aporte invalido")
		return
	}
	if in.Date == "" {
		in.Date = time.Now().Format("2006-01-02")
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var target, current float64
	err = tx.QueryRow(r.Context(), `SELECT target_amount,current_amount FROM financial_goals WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL FOR UPDATE`, r.PathValue("id"), userID(r)).Scan(&target, &current)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `INSERT INTO goal_contributions(goal_id,amount,contribution_date) VALUES($1,$2,$3)`, r.PathValue("id"), in.Amount, in.Date); err != nil {
		dbError(w, err)
		return
	}
	next := current + in.Amount
	status := "active"
	if next >= target {
		status = "completed"
	}
	if _, err = tx.Exec(r.Context(), `UPDATE financial_goals SET current_amount=$1,status=$2 WHERE id=$3`, next, status, r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 201, map[string]any{"current_amount": next, "status": status})
}
