package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"financeai/backend/internal/config"
	"financeai/backend/internal/database"
	"financeai/backend/internal/httpapi"
	"financeai/backend/migrations"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		slog.Error("configuracao invalida", "erro", err)
		os.Exit(1)
	}
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("banco indisponivel", "erro", err)
		os.Exit(1)
	}
	defer pool.Close()
	if err := migrations.Up(ctx, pool); err != nil {
		slog.Error("migration falhou", "erro", err)
		os.Exit(1)
	}

	server := &http.Server{Addr: ":" + cfg.Port, Handler: httpapi.New(cfg, pool), ReadHeaderTimeout: 10 * time.Second, ReadTimeout: 20 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 2 * time.Minute}
	go func() {
		slog.Info("Finance AI API iniciada", "porta", cfg.Port, "ambiente", cfg.Environment)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("servidor interrompido", "erro", err)
			cancel()
		}
	}()
	<-ctx.Done()
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		slog.Error("encerramento forcado", "erro", err)
	}
}
