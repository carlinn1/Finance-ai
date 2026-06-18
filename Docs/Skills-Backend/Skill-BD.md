# Skill — Modelagem do Banco de Dados PostgreSQL

## Objetivo
Modelar o banco de dados do App Financeiro com IA usando PostgreSQL, garantindo segurança, escalabilidade e suporte aos módulos principais do sistema.

## Stack
- PostgreSQL
- Migrations SQL
- Docker
- Docker Compose
- UUID como chave primária
- Campos de auditoria: created_at, updated_at, deleted_at

## Entidades principais

### users
Tabela responsável pelos usuários do sistema.

Campos:
- id UUID PK
- full_name VARCHAR
- email VARCHAR UNIQUE
- password_hash TEXT
- profile_type VARCHAR
- default_currency VARCHAR
- timezone VARCHAR
- email_verified BOOLEAN
- two_factor_enabled BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

### user_oauth_accounts
Vincula login social ao usuário.

Campos:
- id UUID PK
- user_id UUID FK users
- provider VARCHAR
- provider_user_id VARCHAR
- created_at TIMESTAMP

### financial_accounts
Contas financeiras do usuário.

Campos:
- id UUID PK
- user_id UUID FK users
- name VARCHAR
- type VARCHAR
- institution VARCHAR
- currency VARCHAR
- initial_balance NUMERIC
- current_balance NUMERIC
- status VARCHAR
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

Tipos sugeridos:
- checking
- savings
- wallet
- credit_card
- investment

### categories
Categorias e subcategorias.

Campos:
- id UUID PK
- user_id UUID NULL FK users
- parent_id UUID NULL FK categories
- name VARCHAR
- type VARCHAR
- icon VARCHAR
- color VARCHAR
- is_default BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

Tipos:
- income
- expense
- both

### transactions
Receitas, despesas e transferências.

Campos:
- id UUID PK
- user_id UUID FK users
- account_id UUID FK financial_accounts
- category_id UUID FK categories
- contact_id UUID NULL FK contacts
- type VARCHAR
- amount NUMERIC
- transaction_date DATE
- description TEXT
- is_recurring BOOLEAN
- recurrence_id UUID NULL
- installment_group_id UUID NULL
- transfer_group_id UUID NULL
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

Tipos:
- income
- expense
- transfer

### transaction_audit_logs
Histórico de alterações das transações.

Campos:
- id UUID PK
- transaction_id UUID FK transactions
- user_id UUID FK users
- action VARCHAR
- old_data JSONB
- new_data JSONB
- created_at TIMESTAMP

### recurring_transactions
Configurações de recorrência.

Campos:
- id UUID PK
- user_id UUID FK users
- account_id UUID FK financial_accounts
- category_id UUID FK categories
- type VARCHAR
- amount NUMERIC
- description TEXT
- frequency VARCHAR
- start_date DATE
- end_date DATE NULL
- status VARCHAR
- created_at TIMESTAMP
- updated_at TIMESTAMP

Frequências:
- daily
- weekly
- monthly
- yearly

### imports
Controle de importação de extratos.

Campos:
- id UUID PK
- user_id UUID FK users
- account_id UUID FK financial_accounts
- file_name VARCHAR
- file_type VARCHAR
- status VARCHAR
- total_records INTEGER
- imported_records INTEGER
- duplicated_records INTEGER
- created_at TIMESTAMP

Tipos:
- csv
- ofx
- pdf

### ai_category_suggestions
Sugestões de categoria feitas por IA.

Campos:
- id UUID PK
- user_id UUID FK users
- transaction_id UUID FK transactions
- suggested_category_id UUID FK categories
- confidence NUMERIC
- accepted BOOLEAN
- created_at TIMESTAMP

### ai_chats
Conversas com o assistente financeiro.

Campos:
- id UUID PK
- user_id UUID FK users
- title VARCHAR
- created_at TIMESTAMP
- updated_at TIMESTAMP

### ai_chat_messages
Mensagens do chat financeiro.

Campos:
- id UUID PK
- chat_id UUID FK ai_chats
- role VARCHAR
- content TEXT
- metadata JSONB
- created_at TIMESTAMP

Roles:
- user
- assistant
- system

### bills
Contas a pagar e receber.

Campos:
- id UUID PK
- user_id UUID FK users
- account_id UUID FK financial_accounts
- category_id UUID FK categories
- contact_id UUID NULL FK contacts
- type VARCHAR
- description TEXT
- amount NUMERIC
- due_date DATE
- paid_amount NUMERIC
- paid_at DATE NULL
- status VARCHAR
- is_recurring BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

Tipos:
- payable
- receivable

Status:
- pending
- paid
- overdue
- partial

### budgets
Orçamento por categoria.

Campos:
- id UUID PK
- user_id UUID FK users
- category_id UUID FK categories
- month INTEGER
- year INTEGER
- limit_amount NUMERIC
- is_recurring BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP

### financial_goals
Metas financeiras.

Campos:
- id UUID PK
- user_id UUID FK users
- account_id UUID FK financial_accounts
- name VARCHAR
- target_amount NUMERIC
- current_amount NUMERIC
- deadline DATE
- description TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

### goal_contributions
Aportes em metas.

Campos:
- id UUID PK
- goal_id UUID FK financial_goals
- transaction_id UUID NULL FK transactions
- amount NUMERIC
- contribution_date DATE
- created_at TIMESTAMP

### contacts
Clientes, fornecedores e pessoas.

Campos:
- id UUID PK
- user_id UUID FK users
- name VARCHAR
- document VARCHAR
- email VARCHAR
- phone VARCHAR
- notes TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
- deleted_at TIMESTAMP

### licenses
Licença única do sistema.

Campos:
- id UUID PK
- user_id UUID FK users
- status VARCHAR
- payment_gateway VARCHAR
- payment_reference VARCHAR
- trial_started_at TIMESTAMP
- trial_ends_at TIMESTAMP
- purchased_at TIMESTAMP NULL
- created_at TIMESTAMP
- updated_at TIMESTAMP

Status:
- trial
- active
- expired
- blocked

### notifications
Alertas in-app e por e-mail.

Campos:
- id UUID PK
- user_id UUID FK users
- type VARCHAR
- title VARCHAR
- message TEXT
- channel VARCHAR
- read_at TIMESTAMP NULL
- created_at TIMESTAMP

## Regras importantes
- Toda entidade financeira deve possuir user_id para isolamento multiusuário.
- Soft delete deve ser usado nas principais tabelas.
- Valores monetários devem usar NUMERIC(14,2).
- Nunca usar FLOAT para dinheiro.
- Campos sensíveis devem ser criptografados ou armazenados com hash.
- Criar índices para:
  - user_id
  - account_id
  - category_id
  - transaction_date
  - due_date
  - status
  - email

## Dockerização do banco

Criar serviço PostgreSQL no docker-compose:

- postgres
- volume persistente
- healthcheck
- variáveis via .env

Exemplo de variáveis:

POSTGRES_DB=finance_app
POSTGRES_USER=finance_user
POSTGRES_PASSWORD=finance_password
POSTGRES_PORT=5432