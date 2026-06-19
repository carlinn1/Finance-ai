CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash TEXT,
    profile_type VARCHAR(30) NOT NULL DEFAULT 'personal' CHECK (profile_type IN ('personal','self_employed','business')),
    default_currency CHAR(3) NOT NULL DEFAULT 'BRL',
    timezone VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo',
    avatar_url TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,
    failed_login_attempts SMALLINT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (LOWER(email)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS user_oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL CHECK (provider IN ('google','github')), provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ,
    user_agent TEXT, ip_address INET, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL, type VARCHAR(30) NOT NULL CHECK (type IN ('checking','savings','wallet','credit_card','investment')),
    institution VARCHAR(120) NOT NULL DEFAULT '', currency CHAR(3) NOT NULL DEFAULT 'BRL',
    initial_balance NUMERIC(14,2) NOT NULL DEFAULT 0, current_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ,
    UNIQUE(user_id, name)
);
CREATE INDEX IF NOT EXISTS accounts_user_idx ON financial_accounts(user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, name VARCHAR(100) NOT NULL,
    type VARCHAR(15) NOT NULL CHECK (type IN ('income','expense','both')), icon VARCHAR(80) NOT NULL DEFAULT '', color CHAR(7) NOT NULL DEFAULT '#94A3B8',
    is_default BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS categories_user_idx ON categories(user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categories_default_name_unique ON categories(LOWER(name)) WHERE user_id IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_unique ON categories(user_id, LOWER(name)) WHERE user_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL, document VARCHAR(30), email VARCHAR(320), phone VARCHAR(30), notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS contacts_user_idx ON contacts(user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id), category_id UUID REFERENCES categories(id), type VARCHAR(15) NOT NULL CHECK (type IN ('income','expense')),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0), description TEXT NOT NULL, frequency VARCHAR(15) NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
    start_date DATE NOT NULL, end_date DATE, next_run_date DATE, status VARCHAR(15) NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS recurrences_user_idx ON recurring_transactions(user_id);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id), category_id UUID REFERENCES categories(id), contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    type VARCHAR(15) NOT NULL CHECK (type IN ('income','expense','transfer')), amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL, description TEXT NOT NULL, is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL, installment_group_id UUID, transfer_group_id UUID,
    import_fingerprint TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions(user_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_account_idx ON transactions(account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions(category_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_import_fingerprint_unique ON transactions(user_id, import_fingerprint) WHERE import_fingerprint IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS transaction_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), transaction_id UUID NOT NULL REFERENCES transactions(id), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, old_data JSONB, new_data JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS transaction_audit_user_idx ON transaction_audit_logs(user_id, transaction_id);

CREATE TABLE IF NOT EXISTS imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id), file_name VARCHAR(255) NOT NULL, file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('csv','ofx','pdf')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','preview','confirmed','cancelled','failed')),
    total_records INTEGER NOT NULL DEFAULT 0, imported_records INTEGER NOT NULL DEFAULT 0, duplicated_records INTEGER NOT NULL DEFAULT 0,
    preview_data JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS imports_user_idx ON imports(user_id);

CREATE TABLE IF NOT EXISTS category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id), keyword VARCHAR(160) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_category_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE, suggested_category_id UUID NOT NULL REFERENCES categories(id),
    confidence NUMERIC(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1), accepted BOOLEAN, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_chats_user_idx ON ai_chats(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
    role VARCHAR(15) NOT NULL CHECK (role IN ('user','assistant','system')), content TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES financial_accounts(id), category_id UUID REFERENCES categories(id), contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    type VARCHAR(15) NOT NULL CHECK (type IN ('payable','receivable')), description TEXT NOT NULL, amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL, paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0), paid_at DATE,
    status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','partial')),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS bills_user_due_idx ON bills(user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS bills_status_idx ON bills(status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id), month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12), year SMALLINT NOT NULL CHECK (year BETWEEN 2000 AND 2200),
    limit_amount NUMERIC(14,2) NOT NULL CHECK (limit_amount > 0), is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, category_id, month, year)
);
CREATE INDEX IF NOT EXISTS budgets_user_period_idx ON budgets(user_id, year, month);

CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES financial_accounts(id), name VARCHAR(160) NOT NULL, target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0), deadline DATE NOT NULL, description TEXT,
    monthly_contribution NUMERIC(14,2) NOT NULL DEFAULT 0, status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS goals_user_idx ON financial_goals(user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL, amount NUMERIC(14,2) NOT NULL CHECK (amount > 0), contribution_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(15) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','expired','blocked')),
    payment_gateway VARCHAR(50), payment_reference VARCHAR(160), trial_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '14 days', purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL, title VARCHAR(180) NOT NULL, message TEXT NOT NULL, channel VARCHAR(20) NOT NULL DEFAULT 'in_app',
    read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bills_due BOOLEAN NOT NULL DEFAULT TRUE, budget_threshold BOOLEAN NOT NULL DEFAULT TRUE,
    low_balance BOOLEAN NOT NULL DEFAULT TRUE, ai_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    widget_key VARCHAR(80) NOT NULL, position INTEGER NOT NULL, visible BOOLEAN NOT NULL DEFAULT TRUE,
    settings JSONB NOT NULL DEFAULT '{}', UNIQUE(user_id, widget_key)
);

CREATE TABLE IF NOT EXISTS open_finance_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL, institution VARCHAR(160) NOT NULL, external_id TEXT NOT NULL,
    encrypted_access_token TEXT, status VARCHAR(20) NOT NULL DEFAULT 'active', last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, provider, external_id)
);

DROP TRIGGER IF EXISTS users_updated_at ON users; CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS accounts_updated_at ON financial_accounts; CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON financial_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS categories_updated_at ON categories; CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS transactions_updated_at ON transactions; CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS bills_updated_at ON bills; CREATE TRIGGER bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS budgets_updated_at ON budgets; CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS goals_updated_at ON financial_goals; CREATE TRIGGER goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO categories (name, type, icon, color, is_default) VALUES
('Alimentação','expense','utensils','#F59E0B',TRUE), ('Moradia','expense','house','#8B5CF6',TRUE),
('Transporte','expense','car','#3B82F6',TRUE), ('Saúde','expense','heart-pulse','#10B981',TRUE),
('Lazer','expense','ticket','#EC4899',TRUE), ('Educação','expense','graduation-cap','#06B6D4',TRUE),
('Contas Fixas','expense','receipt','#64748B',TRUE), ('Outros','both','circle-ellipsis','#94A3B8',TRUE),
('Salário','income','briefcase','#059669',TRUE), ('Freelance','income','laptop','#0EA5E9',TRUE),
('Investimentos','both','chart-line','#6366F1',TRUE), ('Transferência','both','arrow-left-right','#475569',TRUE)
ON CONFLICT DO NOTHING;
