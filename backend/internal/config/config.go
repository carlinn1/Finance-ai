package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	AllowedOrigins  []string
	FrontendURL     string
	Environment     string
	AIProvider      string
	AIAPIKey        string
}

func Load() (Config, error) {
	cfg := Config{
		Port:            env("APP_PORT", "8080"),
		DatabaseURL:     env("DATABASE_URL", "postgres://finance_user:finance_password@localhost:5432/finance_app?sslmode=disable"),
		JWTSecret:       os.Getenv("JWT_SECRET"),
		AccessTokenTTL:  durationEnv("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL: durationEnv("REFRESH_TOKEN_TTL", 30*24*time.Hour),
		AllowedOrigins:  splitEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"),
		FrontendURL:     env("FRONTEND_URL", "http://localhost:5173"),
		Environment:     env("APP_ENV", "development"),
		AIProvider:      env("AI_PROVIDER", "local"),
		AIAPIKey:        os.Getenv("AI_API_KEY"),
	}
	if len(cfg.JWTSecret) < 32 {
		return Config{}, fmt.Errorf("JWT_SECRET deve ter pelo menos 32 caracteres")
	}
	return cfg, nil
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func durationEnv(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	if seconds, err := strconv.Atoi(value); err == nil {
		return time.Duration(seconds) * time.Second
	}
	if parsed, err := time.ParseDuration(value); err == nil {
		return parsed
	}
	return fallback
}

func splitEnv(key, fallback string) []string {
	parts := strings.Split(env(key, fallback), ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if value := strings.TrimSpace(part); value != "" {
			result = append(result, value)
		}
	}
	return result
}
