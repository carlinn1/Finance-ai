package migrations

import (
	"context"
	_ "embed"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed 000001_initial.up.sql
var initialMigration string

func Up(ctx context.Context, pool *pgxpool.Pool) error {
	if _, err := pool.Exec(ctx, initialMigration); err != nil {
		return fmt.Errorf("executar migrations: %w", err)
	}
	return nil
}
