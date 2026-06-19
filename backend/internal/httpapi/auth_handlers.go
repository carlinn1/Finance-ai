package httpapi

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image/png"
	"log/slog"
	"net/http"
	"regexp"
	"strings"
	"time"

	"financeai/backend/internal/security"
	"github.com/jackc/pgx/v5"
	"github.com/pquerna/otp/totp"
)

var (
	emailPattern   = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	upperPattern   = regexp.MustCompile(`[A-Z]`)
	numberPattern  = regexp.MustCompile(`[0-9]`)
	specialPattern = regexp.MustCompile(`[^A-Za-z0-9]`)
)

type authUser struct {
	ID               string  `json:"id"`
	FullName         string  `json:"full_name"`
	Email            string  `json:"email"`
	ProfileType      string  `json:"profile_type"`
	DefaultCurrency  string  `json:"default_currency"`
	Timezone         string  `json:"timezone"`
	AvatarURL        *string `json:"avatar_url"`
	EmailVerified    bool    `json:"email_verified"`
	TwoFactorEnabled bool    `json:"two_factor_enabled"`
}

func validPassword(password string) bool {
	return len(password) >= 8 && upperPattern.MatchString(password) && numberPattern.MatchString(password) && specialPattern.MatchString(password)
}
func validProfileType(value string) bool {
	return value == "personal" || value == "self_employed" || value == "business"
}

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FullName    string `json:"full_name"`
		Email       string `json:"email"`
		Password    string `json:"password"`
		ProfileType string `json:"profile_type"`
	}
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, 400, "invalid_request", "Dados de cadastro invalidos")
		return
	}
	input.FullName = strings.TrimSpace(input.FullName)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.ProfileType == "" {
		input.ProfileType = "personal"
	}
	if len(input.FullName) < 2 || !emailPattern.MatchString(input.Email) || !validProfileType(input.ProfileType) {
		writeError(w, 422, "validation_error", "Informe nome, e-mail e perfil validos")
		return
	}
	if !validPassword(input.Password) {
		writeError(w, 422, "weak_password", "A senha deve ter 8 caracteres, maiuscula, numero e simbolo")
		return
	}
	hash, err := security.HashPassword(input.Password)
	if err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel cadastrar")
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var user authUser
	err = tx.QueryRow(r.Context(), `INSERT INTO users(full_name,email,password_hash,profile_type) VALUES($1,$2,$3,$4) RETURNING id,full_name,email,profile_type,default_currency,timezone,avatar_url,email_verified,two_factor_enabled`, input.FullName, input.Email, hash, input.ProfileType).Scan(&user.ID, &user.FullName, &user.Email, &user.ProfileType, &user.DefaultCurrency, &user.Timezone, &user.AvatarURL, &user.EmailVerified, &user.TwoFactorEnabled)
	if err != nil {
		if strings.Contains(err.Error(), "users_email_unique") {
			writeError(w, 409, "email_in_use", "Nao foi possivel criar a conta com estes dados")
			return
		}
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `INSERT INTO licenses(user_id) VALUES($1)`, user.ID); err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `INSERT INTO notification_preferences(user_id) VALUES($1)`, user.ID); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	tokens, err := s.issueTokens(r.Context(), r, user.ID)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"user": user, "tokens": tokens})
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if decodeJSON(r, &input) != nil {
		writeError(w, 400, "invalid_request", "Credenciais invalidas")
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	var id, hash, secret string
	var lockedUntil *time.Time
	var twoFactor bool
	err := s.db.QueryRow(r.Context(), `SELECT id,password_hash,two_factor_enabled,COALESCE(two_factor_secret,''),locked_until FROM users WHERE LOWER(email)=$1 AND deleted_at IS NULL`, input.Email).Scan(&id, &hash, &twoFactor, &secret, &lockedUntil)
	if err != nil || (lockedUntil != nil && lockedUntil.After(time.Now())) || !security.CheckPassword(hash, input.Password) {
		if err == nil {
			_, _ = s.db.Exec(r.Context(), `UPDATE users SET failed_login_attempts=failed_login_attempts+1, locked_until=CASE WHEN failed_login_attempts+1>=5 THEN NOW()+INTERVAL '15 minutes' ELSE locked_until END WHERE id=$1`, id)
		}
		writeError(w, http.StatusUnauthorized, "invalid_credentials", "E-mail ou senha invalidos")
		return
	}
	_, _ = s.db.Exec(r.Context(), `UPDATE users SET failed_login_attempts=0,locked_until=NULL WHERE id=$1`, id)
	if twoFactor {
		challenge, err := security.CreateChallengeToken(id, s.cfg.JWTSecret)
		if err != nil {
			writeError(w, 500, "internal_error", "Nao foi possivel autenticar")
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]any{"requires_2fa": true, "challenge_token": challenge})
		return
	}
	s.completeLogin(w, r, id)
}

func (s *Server) login2FA(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ChallengeToken string `json:"challenge_token"`
		Code           string `json:"code"`
	}
	if decodeJSON(r, &input) != nil {
		writeError(w, 400, "invalid_request", "Codigo invalido")
		return
	}
	id, err := security.ParseChallengeToken(input.ChallengeToken, s.cfg.JWTSecret)
	if err != nil {
		writeError(w, 401, "invalid_challenge", "Verificacao expirada")
		return
	}
	var secret string
	if err = s.db.QueryRow(r.Context(), `SELECT COALESCE(two_factor_secret,'') FROM users WHERE id=$1 AND two_factor_enabled=TRUE AND deleted_at IS NULL`, id).Scan(&secret); err != nil || !totp.Validate(input.Code, secret) {
		writeError(w, 401, "invalid_code", "Codigo de verificacao invalido")
		return
	}
	s.completeLogin(w, r, id)
}

func (s *Server) completeLogin(w http.ResponseWriter, r *http.Request, id string) {
	var user authUser
	err := s.db.QueryRow(r.Context(), `SELECT id,full_name,email,profile_type,default_currency,timezone,avatar_url,email_verified,two_factor_enabled FROM users WHERE id=$1 AND deleted_at IS NULL`, id).Scan(&user.ID, &user.FullName, &user.Email, &user.ProfileType, &user.DefaultCurrency, &user.Timezone, &user.AvatarURL, &user.EmailVerified, &user.TwoFactorEnabled)
	if err != nil {
		dbError(w, err)
		return
	}
	tokens, err := s.issueTokens(r.Context(), r, id)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"user": user, "tokens": tokens})
}

func (s *Server) issueTokens(ctx context.Context, r *http.Request, id string) (security.Tokens, error) {
	access, expires, err := security.CreateAccessToken(id, s.cfg.JWTSecret, s.cfg.AccessTokenTTL)
	if err != nil {
		return security.Tokens{}, err
	}
	refresh, hash, err := security.RandomToken()
	if err != nil {
		return security.Tokens{}, err
	}
	_, err = s.db.Exec(ctx, `INSERT INTO refresh_tokens(user_id,token_hash,expires_at,user_agent) VALUES($1,$2,$3,$4)`, id, hash, time.Now().Add(s.cfg.RefreshTokenTTL), r.UserAgent())
	if err != nil {
		return security.Tokens{}, err
	}
	return security.Tokens{AccessToken: access, RefreshToken: refresh, ExpiresAt: expires}, nil
}

func (s *Server) refresh(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	if decodeJSON(r, &input) != nil || input.RefreshToken == "" {
		writeError(w, 400, "invalid_request", "Refresh token obrigatorio")
		return
	}
	hash := security.HashToken(input.RefreshToken)
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id, tokenID string
	err = tx.QueryRow(r.Context(), `SELECT rt.user_id,rt.id FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE rt.token_hash=$1 AND rt.revoked_at IS NULL AND rt.expires_at>NOW() AND u.deleted_at IS NULL FOR UPDATE`, hash).Scan(&id, &tokenID)
	if err != nil {
		writeError(w, 401, "invalid_refresh_token", "Sessao expirada")
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=$1`, tokenID)
	if err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	tokens, err := s.issueTokens(r.Context(), r, id)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"tokens": tokens})
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	_ = decodeJSON(r, &input)
	if input.RefreshToken != "" {
		_, _ = s.db.Exec(r.Context(), `UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL`, userID(r), security.HashToken(input.RefreshToken))
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email string `json:"email"`
	}
	if decodeJSON(r, &input) == nil {
		var id string
		if s.db.QueryRow(r.Context(), `SELECT id FROM users WHERE LOWER(email)=$1 AND deleted_at IS NULL`, strings.ToLower(strings.TrimSpace(input.Email))).Scan(&id) == nil {
			plain, hash, err := security.RandomToken()
			if err == nil {
				_, _ = s.db.Exec(r.Context(), `UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=$1 AND used_at IS NULL`, id)
				_, _ = s.db.Exec(r.Context(), `INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour')`, id, hash)
				if s.cfg.Environment == "development" {
					slog.Info("link de redefinicao (somente desenvolvimento)", "url", s.cfg.FrontendURL+"/reset-password?token="+plain)
				}
			}
		}
	}
	writeJSON(w, 202, map[string]string{"message": "Se o e-mail estiver cadastrado, as instrucoes serao enviadas"})
}

func (s *Server) resetPassword(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if decodeJSON(r, &input) != nil || !validPassword(input.Password) {
		writeError(w, 422, "validation_error", "Token e nova senha forte sao obrigatorios")
		return
	}
	hash, err := security.HashPassword(input.Password)
	if err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel redefinir")
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id, tokenID string
	err = tx.QueryRow(r.Context(), `SELECT user_id,id FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW() FOR UPDATE`, security.HashToken(input.Token)).Scan(&id, &tokenID)
	if err != nil {
		writeError(w, 400, "invalid_token", "Link invalido ou expirado")
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE users SET password_hash=$1,failed_login_attempts=0,locked_until=NULL WHERE id=$2`, hash, id)
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE password_reset_tokens SET used_at=NOW() WHERE id=$1`, tokenID); err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL`, id); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	w.WriteHeader(204)
}

func (s *Server) getMe(w http.ResponseWriter, r *http.Request) {
	var user authUser
	err := s.db.QueryRow(r.Context(), `SELECT id,full_name,email,profile_type,default_currency,timezone,avatar_url,email_verified,two_factor_enabled FROM users WHERE id=$1`, userID(r)).Scan(&user.ID, &user.FullName, &user.Email, &user.ProfileType, &user.DefaultCurrency, &user.Timezone, &user.AvatarURL, &user.EmailVerified, &user.TwoFactorEnabled)
	if err != nil {
		dbError(w, err)
		return
	}
	writeJSON(w, 200, user)
}

func (s *Server) updateMe(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FullName        string  `json:"full_name"`
		ProfileType     string  `json:"profile_type"`
		DefaultCurrency string  `json:"default_currency"`
		Timezone        string  `json:"timezone"`
		AvatarURL       *string `json:"avatar_url"`
	}
	if decodeJSON(r, &input) != nil || len(strings.TrimSpace(input.FullName)) < 2 || !validProfileType(input.ProfileType) || len(input.DefaultCurrency) != 3 || input.Timezone == "" {
		writeError(w, 422, "validation_error", "Dados de perfil invalidos")
		return
	}
	if input.AvatarURL != nil && len(*input.AvatarURL) > 2800000 {
		writeError(w, 413, "image_too_large", "Imagem muito grande")
		return
	}
	_, err := s.db.Exec(r.Context(), `UPDATE users SET full_name=$1,profile_type=$2,default_currency=UPPER($3),timezone=$4,avatar_url=$5 WHERE id=$6`, strings.TrimSpace(input.FullName), input.ProfileType, input.DefaultCurrency, input.Timezone, input.AvatarURL, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	s.getMe(w, r)
}

func (s *Server) changePassword(w http.ResponseWriter, r *http.Request) {
	var input struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if decodeJSON(r, &input) != nil || !validPassword(input.NewPassword) {
		writeError(w, 422, "validation_error", "Nova senha nao atende aos requisitos")
		return
	}
	var hash string
	if err := s.db.QueryRow(r.Context(), `SELECT password_hash FROM users WHERE id=$1`, userID(r)).Scan(&hash); err != nil || !security.CheckPassword(hash, input.CurrentPassword) {
		writeError(w, 401, "invalid_credentials", "Senha atual invalida")
		return
	}
	next, err := security.HashPassword(input.NewPassword)
	if err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel alterar a senha")
		return
	}
	_, err = s.db.Exec(r.Context(), `UPDATE users SET password_hash=$1 WHERE id=$2`, next, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	_, _ = s.db.Exec(r.Context(), `UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL`, userID(r))
	w.WriteHeader(204)
}

func (s *Server) deleteMe(w http.ResponseWriter, r *http.Request) {
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		dbError(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	_, err = tx.Exec(r.Context(), `UPDATE users SET deleted_at=NOW(),email=email||'.deleted.'||id::text WHERE id=$1`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL`, userID(r)); err != nil {
		dbError(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbError(w, err)
		return
	}
	w.WriteHeader(204)
}

func (s *Server) setup2FA(w http.ResponseWriter, r *http.Request) {
	var email string
	if err := s.db.QueryRow(r.Context(), `SELECT email FROM users WHERE id=$1`, userID(r)).Scan(&email); err != nil {
		dbError(w, err)
		return
	}
	key, err := totp.Generate(totp.GenerateOpts{Issuer: "Finance AI", AccountName: email})
	if err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel gerar 2FA")
		return
	}
	_, err = s.db.Exec(r.Context(), `UPDATE users SET two_factor_secret=$1,two_factor_enabled=FALSE WHERE id=$2`, key.Secret(), userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	image, err := key.Image(256, 256)
	if err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel gerar QR Code")
		return
	}
	var buffer bytes.Buffer
	if err = png.Encode(&buffer, image); err != nil {
		writeError(w, 500, "internal_error", "Nao foi possivel gerar QR Code")
		return
	}
	writeJSON(w, 200, map[string]string{"secret": key.Secret(), "otpauth_url": key.URL(), "qr_code": "data:image/png;base64," + base64.StdEncoding.EncodeToString(buffer.Bytes())})
}

func (s *Server) verify2FA(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Code string `json:"code"`
	}
	if decodeJSON(r, &input) != nil {
		writeError(w, 400, "invalid_request", "Codigo obrigatorio")
		return
	}
	var secret string
	if err := s.db.QueryRow(r.Context(), `SELECT COALESCE(two_factor_secret,'') FROM users WHERE id=$1`, userID(r)).Scan(&secret); err != nil {
		dbError(w, err)
		return
	}
	if secret == "" || !totp.Validate(input.Code, secret) {
		writeError(w, 422, "invalid_code", "Codigo invalido")
		return
	}
	_, err := s.db.Exec(r.Context(), `UPDATE users SET two_factor_enabled=TRUE WHERE id=$1`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	w.WriteHeader(204)
}

func (s *Server) disable2FA(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Code string `json:"code"`
	}
	if decodeJSON(r, &input) != nil {
		writeError(w, 400, "invalid_request", "Codigo obrigatorio")
		return
	}
	var secret string
	if err := s.db.QueryRow(r.Context(), `SELECT COALESCE(two_factor_secret,'') FROM users WHERE id=$1`, userID(r)).Scan(&secret); err != nil {
		dbError(w, err)
		return
	}
	if !totp.Validate(input.Code, secret) {
		writeError(w, 422, "invalid_code", "Codigo invalido")
		return
	}
	_, err := s.db.Exec(r.Context(), `UPDATE users SET two_factor_enabled=FALSE,two_factor_secret=NULL WHERE id=$1`, userID(r))
	if err != nil {
		dbError(w, err)
		return
	}
	w.WriteHeader(204)
}

func (s *Server) oauthUnavailable(provider string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeError(w, http.StatusNotImplemented, "oauth_not_configured", fmt.Sprintf("OAuth %s ainda nao foi configurado neste ambiente", provider))
	}
}

var _ = pgx.ErrNoRows
