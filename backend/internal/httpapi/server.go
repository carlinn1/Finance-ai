package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"financeai/backend/internal/config"
	"financeai/backend/internal/security"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	cfg     config.Config
	db      *pgxpool.Pool
	mux     *http.ServeMux
	limiter *rateLimiter
}

type contextKey string

const userIDKey contextKey = "user_id"

func New(cfg config.Config, db *pgxpool.Pool) http.Handler {
	s := &Server{cfg: cfg, db: db, mux: http.NewServeMux(), limiter: newRateLimiter()}
	s.routes()
	return s.recoverPanic(s.securityHeaders(s.cors(s.requestLog(s.mux))))
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /health", s.health)
	s.mux.HandleFunc("POST /api/v1/auth/register", s.limit(10, time.Minute, s.register))
	s.mux.HandleFunc("POST /api/v1/auth/login", s.limit(10, time.Minute, s.login))
	s.mux.HandleFunc("POST /api/v1/auth/2fa/login", s.limit(10, time.Minute, s.login2FA))
	s.mux.HandleFunc("POST /api/v1/auth/refresh", s.refresh)
	s.mux.HandleFunc("POST /api/v1/auth/forgot-password", s.limit(5, time.Hour, s.forgotPassword))
	s.mux.HandleFunc("POST /api/v1/auth/reset-password", s.limit(10, time.Hour, s.resetPassword))
	s.mux.HandleFunc("GET /api/v1/auth/google", s.oauthUnavailable("Google"))
	s.mux.HandleFunc("GET /api/v1/auth/github", s.oauthUnavailable("GitHub"))

	protected := func(pattern string, handler http.HandlerFunc) { s.mux.HandleFunc(pattern, s.auth(handler)) }
	protected("POST /api/v1/auth/logout", s.logout)
	protected("GET /api/v1/users/me", s.getMe)
	protected("PUT /api/v1/users/me", s.updateMe)
	protected("PUT /api/v1/users/me/password", s.changePassword)
	protected("DELETE /api/v1/users/me", s.deleteMe)
	protected("POST /api/v1/auth/2fa/setup", s.setup2FA)
	protected("POST /api/v1/auth/2fa/verify", s.verify2FA)
	protected("POST /api/v1/auth/2fa/disable", s.disable2FA)

	protected("GET /api/v1/accounts", s.listAccounts)
	protected("POST /api/v1/accounts", s.createAccount)
	protected("GET /api/v1/accounts/{id}", s.getAccount)
	protected("PUT /api/v1/accounts/{id}", s.updateAccount)
	protected("DELETE /api/v1/accounts/{id}", s.deleteAccount)
	protected("GET /api/v1/accounts/{id}/statement", s.accountStatement)
	protected("POST /api/v1/accounts/{id}/reconcile", s.reconcileAccount)

	protected("GET /api/v1/categories", s.listCategories)
	protected("GET /api/v1/categories/defaults", s.listCategories)
	protected("POST /api/v1/categories", s.createCategory)
	protected("PUT /api/v1/categories/{id}", s.updateCategory)
	protected("DELETE /api/v1/categories/{id}", s.deleteCategory)

	protected("GET /api/v1/transactions", s.listTransactions)
	protected("POST /api/v1/transactions", s.createTransaction)
	protected("GET /api/v1/transactions/{id}", s.getTransaction)
	protected("PUT /api/v1/transactions/{id}", s.updateTransaction)
	protected("DELETE /api/v1/transactions/{id}", s.deleteTransaction)
	protected("POST /api/v1/transactions/{id}/duplicate", s.duplicateTransaction)
	protected("GET /api/v1/transactions/{id}/audit", s.transactionAudit)
	protected("POST /api/v1/transactions/transfer", s.createTransfer)
	protected("POST /api/v1/imports", s.createImport)
	protected("GET /api/v1/imports", s.listImports)
	protected("GET /api/v1/imports/{id}/preview", s.importPreview)
	protected("POST /api/v1/imports/{id}/confirm", s.confirmImport)
	protected("DELETE /api/v1/imports/{id}", s.deleteImport)

	protected("GET /api/v1/bills", s.listBills)
	protected("POST /api/v1/bills", s.createBill)
	protected("PUT /api/v1/bills/{id}", s.updateBill)
	protected("DELETE /api/v1/bills/{id}", s.deleteBill)
	protected("POST /api/v1/bills/{id}/pay", s.payBill)
	protected("POST /api/v1/bills/{id}/partial-payment", s.partialPayBill)

	protected("GET /api/v1/budgets", s.listBudgets)
	protected("POST /api/v1/budgets", s.upsertBudget)
	protected("PUT /api/v1/budgets/{id}", s.updateBudget)
	protected("DELETE /api/v1/budgets/{id}", s.deleteBudget)

	protected("GET /api/v1/goals", s.listGoals)
	protected("POST /api/v1/goals", s.createGoal)
	protected("PUT /api/v1/goals/{id}", s.updateGoal)
	protected("DELETE /api/v1/goals/{id}", s.deleteGoal)
	protected("POST /api/v1/goals/{id}/contributions", s.addGoalContribution)

	protected("GET /api/v1/dashboard/summary", s.dashboard)
	protected("GET /api/v1/reports/dre", s.reportDRE)
	protected("GET /api/v1/reports/cashflow", s.reportCashflow)
	protected("GET /api/v1/reports/categories", s.reportCategories)
	protected("GET /api/v1/reports/export/csv", s.exportCSV)

	protected("GET /api/v1/ai/cashflow-forecast", s.cashflowForecast)
	protected("GET /api/v1/ai/recommendations", s.recommendations)
	protected("GET /api/v1/ai/chats", s.listChats)
	protected("POST /api/v1/ai/chats", s.createChat)
	protected("GET /api/v1/ai/chats/{id}", s.getChat)
	protected("POST /api/v1/ai/chats/{id}/messages", s.chatMessage)

	protected("GET /api/v1/licenses/me", s.getLicense)
	protected("GET /api/v1/notifications", s.listNotifications)
	protected("PATCH /api/v1/notifications/{id}/read", s.readNotification)
	protected("PATCH /api/v1/notifications/read-all", s.readAllNotifications)
	protected("GET /api/v1/notifications/preferences", s.getNotificationPreferences)
	protected("PUT /api/v1/notifications/preferences", s.updateNotificationPreferences)
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := s.db.Ping(ctx); err != nil {
		writeError(w, http.StatusServiceUnavailable, "database_unavailable", "Banco de dados indisponivel")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "time": time.Now().UTC()})
}

func (s *Server) auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		header := strings.TrimSpace(r.Header.Get("Authorization"))
		if !strings.HasPrefix(header, "Bearer ") {
			writeError(w, http.StatusUnauthorized, "unauthorized", "Autenticacao necessaria")
			return
		}
		userID, err := security.ParseAccessToken(strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")), s.cfg.JWTSecret)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid_token", "Sessao invalida ou expirada")
			return
		}
		var active bool
		if err := s.db.QueryRow(r.Context(), `SELECT deleted_at IS NULL FROM users WHERE id=$1`, userID).Scan(&active); err != nil || !active {
			writeError(w, http.StatusUnauthorized, "unauthorized", "Sessao invalida")
			return
		}
		next(w, r.WithContext(context.WithValue(r.Context(), userIDKey, userID)))
	}
}

func userID(r *http.Request) string { value, _ := r.Context().Value(userIDKey).(string); return value }

func decodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 3<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dst); err != nil {
		return fmt.Errorf("json invalido: %w", err)
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if status != http.StatusNoContent {
		_ = json.NewEncoder(w).Encode(value)
	}
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{"error": map[string]string{"code": code, "message": message}})
}

func dbError(w http.ResponseWriter, err error) {
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusNotFound, "not_found", "Registro nao encontrado")
		return
	}
	slog.Error("erro de banco", "erro", err)
	writeError(w, http.StatusInternalServerError, "internal_error", "Nao foi possivel concluir a operacao")
}

func (s *Server) cors(next http.Handler) http.Handler {
	allowed := make(map[string]bool, len(s.cfg.AllowedOrigins))
	for _, origin := range s.cfg.AllowedOrigins {
		allowed[origin] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "same-origin")
		next.ServeHTTP(w, r)
	})
}
func (s *Server) requestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		next.ServeHTTP(w, r)
		slog.Info("request", "method", r.Method, "path", r.URL.Path, "duration", time.Since(started))
	})
}
func (s *Server) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				slog.Error("panic", "erro", recovered, "stack", string(debug.Stack()))
				writeError(w, 500, "internal_error", "Erro interno")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

type rateEntry struct {
	count int
	reset time.Time
}
type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]rateEntry
}

func newRateLimiter() *rateLimiter { return &rateLimiter{entries: map[string]rateEntry{}} }
func (s *Server) limit(max int, window time.Duration, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.RemoteAddr + "|" + r.URL.Path
		now := time.Now()
		s.limiter.mu.Lock()
		entry := s.limiter.entries[key]
		if now.After(entry.reset) {
			entry = rateEntry{reset: now.Add(window)}
		}
		entry.count++
		s.limiter.entries[key] = entry
		s.limiter.mu.Unlock()
		if entry.count > max {
			writeError(w, 429, "rate_limited", "Muitas tentativas. Tente novamente mais tarde")
			return
		}
		next(w, r)
	}
}
