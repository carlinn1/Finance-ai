package security

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID string `json:"uid"`
	Type   string `json:"typ"`
	jwt.RegisteredClaims
}

type Tokens struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(hash), err
}

func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func CreateAccessToken(userID, secret string, ttl time.Duration) (string, time.Time, error) {
	now := time.Now().UTC()
	expires := now.Add(ttl)
	claims := Claims{UserID: userID, Type: "access", RegisteredClaims: jwt.RegisteredClaims{Subject: userID, IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(expires)}}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	return token, expires, err
}

func CreateChallengeToken(userID, secret string) (string, error) {
	now := time.Now().UTC()
	claims := Claims{UserID: userID, Type: "2fa", RegisteredClaims: jwt.RegisteredClaims{Subject: userID, IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(5 * time.Minute))}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func ParseChallengeToken(raw, secret string) (string, error) {
	token, err := jwt.ParseWithClaims(raw, &Claims{}, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("algoritmo JWT invalido")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("desafio invalido")
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || claims.Type != "2fa" || claims.UserID == "" {
		return "", errors.New("desafio invalido")
	}
	return claims.UserID, nil
}

func ParseAccessToken(raw, secret string) (string, error) {
	token, err := jwt.ParseWithClaims(raw, &Claims{}, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("algoritmo JWT invalido")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("token invalido")
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || claims.Type != "access" || claims.UserID == "" {
		return "", errors.New("token invalido")
	}
	return claims.UserID, nil
}

func RandomToken() (plain, hash string, err error) {
	data := make([]byte, 32)
	if _, err = rand.Read(data); err != nil {
		return "", "", err
	}
	plain = base64.RawURLEncoding.EncodeToString(data)
	return plain, HashToken(plain), nil
}

func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}
