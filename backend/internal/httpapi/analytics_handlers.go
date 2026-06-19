package httpapi

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func (s *Server) dashboard(w http.ResponseWriter, r *http.Request) {
	uid := userID(r)
	ctx := r.Context()
	var balance, income, expense float64
	var accountCount, incomeCount, expenseCount int
	err := s.db.QueryRow(ctx, `SELECT COALESCE((SELECT SUM(current_balance) FROM financial_accounts WHERE user_id=$1 AND status='active' AND deleted_at IS NULL),0),COALESCE(SUM(amount) FILTER(WHERE type='income'),0),COALESCE(SUM(amount) FILTER(WHERE type='expense'),0),COUNT(*) FILTER(WHERE type='income'),COUNT(*) FILTER(WHERE type='expense'),(SELECT COUNT(*) FROM financial_accounts WHERE user_id=$1 AND status='active' AND deleted_at IS NULL) FROM transactions WHERE user_id=$1 AND deleted_at IS NULL AND transaction_date>=date_trunc('month',CURRENT_DATE)`, uid).Scan(&balance, &income, &expense, &incomeCount, &expenseCount, &accountCount)
	if err != nil {
		dbError(w, err)
		return
	}
	monthly := []map[string]any{}
	rows, err := s.db.Query(ctx, `WITH months AS (SELECT generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month')::date month) SELECT to_char(m.month,'Mon'),COALESCE(SUM(t.amount) FILTER(WHERE t.type='income'),0),COALESCE(SUM(t.amount) FILTER(WHERE t.type='expense'),0),COALESCE(SUM(CASE WHEN t.type='income' THEN t.amount WHEN t.type='expense' THEN -t.amount ELSE 0 END),0) FROM months m LEFT JOIN transactions t ON t.user_id=$1 AND t.deleted_at IS NULL AND date_trunc('month',t.transaction_date)=m.month GROUP BY m.month ORDER BY m.month`, uid)
	if err != nil {
		dbError(w, err)
		return
	}
	for rows.Next() {
		var month string
		var inc, exp, result float64
		if err = rows.Scan(&month, &inc, &exp, &result); err != nil {
			rows.Close()
			dbError(w, err)
			return
		}
		monthly = append(monthly, map[string]any{"month": translateMonth(month), "receita": inc, "despesa": exp, "resultado": result})
	}
	rows.Close()
	categories := []map[string]any{}
	rows, err = s.db.Query(ctx, `SELECT c.id,c.name,c.color,COALESCE(SUM(t.amount),0) FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.user_id=$1 AND t.type='expense' AND t.deleted_at IS NULL AND t.transaction_date>=date_trunc('month',CURRENT_DATE) GROUP BY c.id,c.name,c.color ORDER BY 4 DESC`, uid)
	if err != nil {
		dbError(w, err)
		return
	}
	for rows.Next() {
		var id, name, color string
		var value float64
		if err = rows.Scan(&id, &name, &color, &value); err != nil {
			rows.Close()
			dbError(w, err)
			return
		}
		categories = append(categories, map[string]any{"id": id, "name": name, "label": name, "color": color, "value": value})
	}
	rows.Close()
	accounts := []accountResponse{}
	rows, err = s.db.Query(ctx, `SELECT id,name,type,institution,currency,initial_balance,current_balance,status FROM financial_accounts WHERE user_id=$1 AND status='active' AND deleted_at IS NULL ORDER BY name`, uid)
	if err != nil {
		dbError(w, err)
		return
	}
	for rows.Next() {
		var v accountResponse
		if err = rows.Scan(&v.ID, &v.Name, &v.Type, &v.Institution, &v.Currency, &v.InitialBalance, &v.CurrentBalance, &v.Status); err != nil {
			rows.Close()
			dbError(w, err)
			return
		}
		accounts = append(accounts, v)
	}
	rows.Close()
	recent := []transactionResponse{}
	rows, err = s.db.Query(ctx, transactionSelect+` WHERE t.user_id=$1 AND t.deleted_at IS NULL ORDER BY t.transaction_date DESC,t.created_at DESC LIMIT 5`, uid)
	if err != nil {
		dbError(w, err)
		return
	}
	for rows.Next() {
		v, err := scanTransaction(rows)
		if err != nil {
			rows.Close()
			dbError(w, err)
			return
		}
		recent = append(recent, v)
	}
	rows.Close()
	upcoming := []billResponse{}
	rows, err = s.db.Query(ctx, billSelect+` WHERE b.user_id=$1 AND b.deleted_at IS NULL AND b.status IN ('pending','partial') AND b.due_date<=CURRENT_DATE+INTERVAL '14 days' ORDER BY b.due_date LIMIT 5`, uid)
	if err != nil {
		dbError(w, err)
		return
	}
	for rows.Next() {
		v, err := scanBill(rows)
		if err != nil {
			rows.Close()
			dbError(w, err)
			return
		}
		upcoming = append(upcoming, v)
	}
	rows.Close()
	alerts, err := s.buildRecommendations(r)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"period": time.Now().Format("2006-01"), "summary": map[string]any{"balance": balance, "income": income, "expense": expense, "result": income - expense, "account_count": accountCount, "income_count": incomeCount, "expense_count": expenseCount}, "monthly": monthly, "categories": categories, "accounts": accounts, "recent_transactions": recent, "upcoming_bills": upcoming, "alerts": alerts})
}
func translateMonth(v string) string {
	m := map[string]string{"Jan": "Jan", "Feb": "Fev", "Mar": "Mar", "Apr": "Abr", "May": "Mai", "Jun": "Jun", "Jul": "Jul", "Aug": "Ago", "Sep": "Set", "Oct": "Out", "Nov": "Nov", "Dec": "Dez"}
	if x := m[strings.TrimSpace(v)]; x != "" {
		return x
	}
	return v
}

func reportPeriod(r *http.Request) (string, string) {
	end := time.Now()
	start := time.Date(end.Year(), end.Month(), 1, 0, 0, 0, 0, end.Location())
	if v := r.URL.Query().Get("start_date"); v != "" {
		if parsed, err := time.Parse("2006-01-02", v); err == nil {
			start = parsed
		}
	}
	if v := r.URL.Query().Get("end_date"); v != "" {
		if parsed, err := time.Parse("2006-01-02", v); err == nil {
			end = parsed
		}
	}
	return start.Format("2006-01-02"), end.Format("2006-01-02")
}
func (s *Server) reportDRE(w http.ResponseWriter, r *http.Request) {
	start, end := reportPeriod(r)
	rows, err := s.db.Query(r.Context(), `SELECT COALESCE(c.name,'Sem categoria'),t.type,COUNT(*),SUM(t.amount) FROM transactions t LEFT JOIN categories c ON c.id=t.category_id WHERE t.user_id=$1 AND t.deleted_at IS NULL AND t.type IN ('income','expense') AND t.transaction_date BETWEEN $2 AND $3 GROUP BY c.name,t.type ORDER BY t.type DESC,4 DESC`, userID(r), start, end)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	var income, expense float64
	for rows.Next() {
		var name, kind string
		var count int
		var total float64
		if err = rows.Scan(&name, &kind, &count, &total); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"category": name, "type": kind, "count": count, "total": total})
		if kind == "income" {
			income += total
		} else {
			expense += total
		}
	}
	writeJSON(w, 200, map[string]any{"start_date": start, "end_date": end, "income": income, "expense": expense, "result": income - expense, "items": items})
}
func (s *Server) reportCashflow(w http.ResponseWriter, r *http.Request) {
	start, end := reportPeriod(r)
	rows, err := s.db.Query(r.Context(), `SELECT to_char(transaction_date,'YYYY-MM-DD'),COALESCE(SUM(amount) FILTER(WHERE type='income'),0),COALESCE(SUM(amount) FILTER(WHERE type='expense'),0) FROM transactions WHERE user_id=$1 AND deleted_at IS NULL AND type IN ('income','expense') AND transaction_date BETWEEN $2 AND $3 GROUP BY transaction_date ORDER BY transaction_date`, userID(r), start, end)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var date string
		var income, expense float64
		if err = rows.Scan(&date, &income, &expense); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"date": date, "income": income, "expense": expense, "result": income - expense})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}
func (s *Server) reportCategories(w http.ResponseWriter, r *http.Request) {
	start, end := reportPeriod(r)
	rows, err := s.db.Query(r.Context(), `SELECT c.id,c.name,c.color,COUNT(t.id),SUM(t.amount) FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.user_id=$1 AND t.deleted_at IS NULL AND t.type='expense' AND t.transaction_date BETWEEN $2 AND $3 GROUP BY c.id,c.name,c.color ORDER BY 5 DESC`, userID(r), start, end)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	var total float64
	for rows.Next() {
		var id, name, color string
		var count int
		var amount float64
		if err = rows.Scan(&id, &name, &color, &count, &amount); err != nil {
			dbError(w, err)
			return
		}
		total += amount
		items = append(items, map[string]any{"id": id, "category": name, "color": color, "count": count, "total": amount})
	}
	writeJSON(w, 200, map[string]any{"total": total, "items": items})
}
func (s *Server) exportCSV(w http.ResponseWriter, r *http.Request) {
	start, end := reportPeriod(r)
	rows, err := s.db.Query(r.Context(), `SELECT t.transaction_date::text,t.description,t.type,t.amount,a.name,COALESCE(c.name,'') FROM transactions t JOIN financial_accounts a ON a.id=t.account_id LEFT JOIN categories c ON c.id=t.category_id WHERE t.user_id=$1 AND t.deleted_at IS NULL AND t.transaction_date BETWEEN $2 AND $3 ORDER BY t.transaction_date`, userID(r), start, end)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="financeai-transacoes.csv"`)
	writer := csv.NewWriter(w)
	_ = writer.Write([]string{"Data", "Descricao", "Tipo", "Valor", "Conta", "Categoria"})
	for rows.Next() {
		var date, description, kind, account, category string
		var amount float64
		if err = rows.Scan(&date, &description, &kind, &amount, &account, &category); err != nil {
			return
		}
		_ = writer.Write([]string{date, description, kind, strconv.FormatFloat(amount, 'f', 2, 64), account, category})
	}
	writer.Flush()
}

func (s *Server) cashflowForecast(w http.ResponseWriter, r *http.Request) {
	days := 60
	if parsed, err := strconv.Atoi(r.URL.Query().Get("period")); err == nil && (parsed == 30 || parsed == 60 || parsed == 90) {
		days = parsed
	}
	var balance float64
	if err := s.db.QueryRow(r.Context(), `SELECT COALESCE(SUM(current_balance),0) FROM financial_accounts WHERE user_id=$1 AND status='active' AND deleted_at IS NULL`, userID(r)).Scan(&balance); err != nil {
		dbError(w, err)
		return
	}
	rows, err := s.db.Query(r.Context(), `WITH points AS (SELECT generate_series(CURRENT_DATE,CURRENT_DATE+$2::int,INTERVAL '7 days')::date d) SELECT p.d::text,COALESCE(SUM(CASE WHEN b.type='receivable' THEN b.amount-b.paid_amount ELSE -(b.amount-b.paid_amount) END) FILTER(WHERE b.due_date<=p.d AND b.status IN ('pending','partial')),0) FROM points p LEFT JOIN bills b ON b.user_id=$1 AND b.deleted_at IS NULL GROUP BY p.d ORDER BY p.d`, userID(r), days)
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	min := balance
	for rows.Next() {
		var date string
		var delta float64
		if err = rows.Scan(&date, &delta); err != nil {
			dbError(w, err)
			return
		}
		realistic := balance + delta
		if realistic < min {
			min = realistic
		}
		margin := realistic * 0.05
		if margin < 250 {
			margin = 250
		}
		items = append(items, map[string]any{"date": date, "realistic": realistic, "optimistic": realistic + margin, "pessimistic": realistic - margin})
	}
	writeJSON(w, 200, map[string]any{"period": days, "current_balance": balance, "minimum_balance": min, "items": items})
}

func (s *Server) buildRecommendations(r *http.Request) ([]map[string]any, error) {
	uid := userID(r)
	items := []map[string]any{}
	rows, err := s.db.Query(r.Context(), `SELECT c.name,SUM(t.amount),b.limit_amount FROM budgets b JOIN categories c ON c.id=b.category_id LEFT JOIN transactions t ON t.user_id=b.user_id AND t.category_id=b.category_id AND t.type='expense' AND t.deleted_at IS NULL AND EXTRACT(MONTH FROM t.transaction_date)=b.month AND EXTRACT(YEAR FROM t.transaction_date)=b.year WHERE b.user_id=$1 AND b.month=EXTRACT(MONTH FROM CURRENT_DATE) AND b.year=EXTRACT(YEAR FROM CURRENT_DATE) GROUP BY c.name,b.limit_amount HAVING COALESCE(SUM(t.amount),0)>=b.limit_amount*.8 ORDER BY SUM(t.amount)/b.limit_amount DESC`, uid)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var name string
		var spent, limit float64
		if err = rows.Scan(&name, &spent, &limit); err != nil {
			rows.Close()
			return nil, err
		}
		level := "warning"
		title := "Orcamento proximo do limite"
		if spent >= limit {
			level = "critical"
			title = "Orcamento ultrapassado"
		}
		items = append(items, map[string]any{"type": "budget", "level": level, "title": title, "message": fmt.Sprintf("%s: R$ %.2f de R$ %.2f", name, spent, limit)})
	}
	rows.Close()
	rows, err = s.db.Query(r.Context(), `SELECT description,due_date::text,amount-paid_amount FROM bills WHERE user_id=$1 AND deleted_at IS NULL AND status IN ('pending','partial') AND due_date<=CURRENT_DATE+INTERVAL '7 days' ORDER BY due_date LIMIT 5`, uid)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var description, date string
		var amount float64
		if err = rows.Scan(&description, &date, &amount); err != nil {
			rows.Close()
			return nil, err
		}
		items = append(items, map[string]any{"type": "bill", "level": "warning", "title": "Vencimento proximo", "message": fmt.Sprintf("%s vence em %s (R$ %.2f)", description, date, amount)})
	}
	rows.Close()
	return items, nil
}
func (s *Server) recommendations(w http.ResponseWriter, r *http.Request) {
	items, err := s.buildRecommendations(r)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (s *Server) listChats(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,title,created_at,updated_at FROM ai_chats WHERE user_id=$1 ORDER BY updated_at DESC`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, title string
		var created, updated time.Time
		if err = rows.Scan(&id, &title, &created, &updated); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "title": title, "created_at": created, "updated_at": updated})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}
func (s *Server) createChat(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Title string `json:"title"`
	}
	_ = decodeJSON(r, &in)
	if strings.TrimSpace(in.Title) == "" {
		in.Title = "Nova conversa"
	}
	var id string
	err := s.db.QueryRow(r.Context(), `INSERT INTO ai_chats(user_id,title) VALUES($1,$2) RETURNING id`, userID(r), in.Title).Scan(&id)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id, "title": in.Title})
}
func (s *Server) getChat(w http.ResponseWriter, r *http.Request) {
	var title string
	if err := s.db.QueryRow(r.Context(), `SELECT title FROM ai_chats WHERE id=$1 AND user_id=$2`, r.PathValue("id"), userID(r)).Scan(&title); err != nil {
		dbError(w, err)
		return
	}
	rows, err := s.db.Query(r.Context(), `SELECT id,role,content,created_at FROM ai_chat_messages WHERE chat_id=$1 ORDER BY created_at`, r.PathValue("id"))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, role, content string
		var created time.Time
		if err = rows.Scan(&id, &role, &content, &created); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "role": role, "content": content, "created_at": created})
	}
	writeJSON(w, 200, map[string]any{"id": r.PathValue("id"), "title": title, "messages": items})
}
func (s *Server) chatMessage(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Content string `json:"content"`
	}
	if decodeJSON(r, &in) != nil || strings.TrimSpace(in.Content) == "" {
		writeError(w, 422, "validation_error", "Mensagem obrigatoria")
		return
	}
	var exists bool
	if err := s.db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM ai_chats WHERE id=$1 AND user_id=$2)`, r.PathValue("id"), userID(r)).Scan(&exists); err != nil || !exists {
		writeError(w, 404, "not_found", "Conversa nao encontrada")
		return
	}
	answer, err := s.financialAnswer(r)
	if err != nil {
		dbError(w, err)
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	if _, err = tx.Exec(r.Context(), `INSERT INTO ai_chat_messages(chat_id,role,content) VALUES($1,'user',$2)`, r.PathValue("id"), strings.TrimSpace(in.Content)); err != nil {
		dbError(w, err)
		return
	}
	var id string
	var created time.Time
	if err = tx.QueryRow(r.Context(), `INSERT INTO ai_chat_messages(chat_id,role,content,metadata) VALUES($1,'assistant',$2,'{"engine":"financial-context"}') RETURNING id,created_at`, r.PathValue("id"), answer).Scan(&id, &created); err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE ai_chats SET title=CASE WHEN title='Nova conversa' THEN LEFT($1,80) ELSE title END,updated_at=NOW() WHERE id=$2`, strings.TrimSpace(in.Content), r.PathValue("id")); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 201, map[string]any{"id": id, "role": "assistant", "content": answer, "created_at": created})
}
func (s *Server) financialAnswer(r *http.Request) (string, error) {
	var balance, income, expense float64
	var pending int
	err := s.db.QueryRow(r.Context(), `SELECT COALESCE((SELECT SUM(current_balance) FROM financial_accounts WHERE user_id=$1 AND status='active' AND deleted_at IS NULL),0),COALESCE(SUM(amount) FILTER(WHERE type='income'),0),COALESCE(SUM(amount) FILTER(WHERE type='expense'),0),(SELECT COUNT(*) FROM bills WHERE user_id=$1 AND deleted_at IS NULL AND status IN ('pending','partial')) FROM transactions WHERE user_id=$1 AND deleted_at IS NULL AND transaction_date>=date_trunc('month',CURRENT_DATE)`, userID(r)).Scan(&balance, &income, &expense, &pending)
	if err != nil {
		return "", err
	}
	result := income - expense
	if income == 0 && expense == 0 {
		return "Ainda nao ha transacoes suficientes para uma analise. Cadastre uma conta e seus primeiros lancamentos; a partir disso eu calculo fluxo, orcamentos e tendencias.", nil
	}
	return fmt.Sprintf("Com base nos seus dados atuais: saldo consolidado de R$ %.2f, receitas de R$ %.2f e despesas de R$ %.2f neste mes. O resultado e R$ %.2f e existem %d contas pendentes. Posso detalhar categorias, vencimentos ou metas.", balance, income, expense, result, pending), nil
}

func (s *Server) getLicense(w http.ResponseWriter, r *http.Request) {
	var status, gateway, reference string
	var trialStart, trialEnd time.Time
	var purchased *time.Time
	err := s.db.QueryRow(r.Context(), `SELECT status,COALESCE(payment_gateway,''),COALESCE(payment_reference,''),trial_started_at,trial_ends_at,purchased_at FROM licenses WHERE user_id=$1`, userID(r)).Scan(&status, &gateway, &reference, &trialStart, &trialEnd, &purchased)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"status": status, "payment_gateway": gateway, "payment_reference": reference, "trial_started_at": trialStart, "trial_ends_at": trialEnd, "purchased_at": purchased})
}
func (s *Server) listNotifications(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `SELECT id,type,title,message,channel,read_at,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, kind, title, message, channel string
		var readAt *time.Time
		var created time.Time
		if err = rows.Scan(&id, &kind, &title, &message, &channel, &readAt, &created); err != nil {
			dbError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "type": kind, "title": title, "message": message, "channel": channel, "read_at": readAt, "created_at": created})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}
func (s *Server) readNotification(w http.ResponseWriter, r *http.Request) {
	tag, err := s.db.Exec(r.Context(), `UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND user_id=$2`, r.PathValue("id"), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, 404, "not_found", "Notificacao nao encontrada")
		return
	}
	w.WriteHeader(204)
}
func (s *Server) readAllNotifications(w http.ResponseWriter, r *http.Request) {
	_, err := s.db.Exec(r.Context(), `UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE user_id=$1`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	w.WriteHeader(204)
}

type notificationPrefs struct {
	BillsDue          bool `json:"bills_due"`
	BudgetThreshold   bool `json:"budget_threshold"`
	LowBalance        bool `json:"low_balance"`
	AIRecommendations bool `json:"ai_recommendations"`
	EmailEnabled      bool `json:"email_enabled"`
}

func (s *Server) getNotificationPreferences(w http.ResponseWriter, r *http.Request) {
	var v notificationPrefs
	err := s.db.QueryRow(r.Context(), `SELECT bills_due,budget_threshold,low_balance,ai_recommendations,email_enabled FROM notification_preferences WHERE user_id=$1`, userID(r)).Scan(&v.BillsDue, &v.BudgetThreshold, &v.LowBalance, &v.AIRecommendations, &v.EmailEnabled)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, v)
}
func (s *Server) updateNotificationPreferences(w http.ResponseWriter, r *http.Request) {
	var v notificationPrefs
	if decodeJSON(r, &v) != nil {
		writeError(w, 400, "invalid_request", "Preferencias invalidas")
		return
	}
	_, err := s.db.Exec(r.Context(), `INSERT INTO notification_preferences(user_id,bills_due,budget_threshold,low_balance,ai_recommendations,email_enabled) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET bills_due=$2,budget_threshold=$3,low_balance=$4,ai_recommendations=$5,email_enabled=$6,updated_at=NOW()`, userID(r), v.BillsDue, v.BudgetThreshold, v.LowBalance, v.AIRecommendations, v.EmailEnabled)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, v)
}
