# Skill — Backend Golang API

## Objetivo
Criar a API REST do App Financeiro com IA usando Golang, PostgreSQL e arquitetura modular, com autenticação segura, regras de negócio financeiras e suporte a Docker.

## Stack
- Golang
- PostgreSQL
- Docker
- Docker Compose
- JWT
- OAuth 2.0
- TOTP 2FA
- Migrations
- Clean Architecture ou arquitetura em camadas

## Estrutura sugerida

/backend
├── cmd
│   └── api
│       └── main.go
├── internal
│   ├── auth
│   ├── users
│   ├── accounts
│   ├── transactions
│   ├── categories
│   ├── imports
│   ├── ai
│   ├── dashboard
│   ├── bills
│   ├── budgets
│   ├── reports
│   ├── goals
│   ├── contacts
│   ├── licenses
│   └── notifications
├── pkg
│   ├── database
│   ├── middleware
│   ├── validator
│   ├── response
│   └── logger
├── migrations
├── Dockerfile
├── docker-compose.yml
└── .env.example

## Endpoints da API

## Auth

### POST /api/v1/auth/register
Cadastrar novo usuário.

Body:
- full_name
- email
- password

### POST /api/v1/auth/login
Login com e-mail e senha.

Body:
- email
- password

### POST /api/v1/auth/refresh
Renovar token JWT.

### POST /api/v1/auth/logout
Encerrar sessão.

### POST /api/v1/auth/forgot-password
Solicitar recuperação de senha.

### POST /api/v1/auth/reset-password
Redefinir senha.

### GET /api/v1/auth/google
Iniciar login com Google.

### GET /api/v1/auth/google/callback
Callback OAuth Google.

### GET /api/v1/auth/github
Iniciar login com GitHub.

### GET /api/v1/auth/github/callback
Callback OAuth GitHub.

### POST /api/v1/auth/2fa/setup
Gerar QR Code para 2FA.

### POST /api/v1/auth/2fa/verify
Validar código 2FA.

### POST /api/v1/auth/2fa/disable
Desativar 2FA.

---

## Users

### GET /api/v1/users/me
Buscar dados do usuário autenticado.

### PUT /api/v1/users/me
Atualizar perfil.

### PUT /api/v1/users/me/email
Alterar e-mail com revalidação.

### PUT /api/v1/users/me/password
Alterar senha.

### DELETE /api/v1/users/me
Excluir conta.

---

## Financial Accounts

### POST /api/v1/accounts
Criar conta financeira.

### GET /api/v1/accounts
Listar contas do usuário.

### GET /api/v1/accounts/:id
Detalhar conta.

### PUT /api/v1/accounts/:id
Atualizar conta.

### DELETE /api/v1/accounts/:id
Arquivar ou excluir conta.

### GET /api/v1/accounts/:id/statement
Buscar extrato da conta.

### POST /api/v1/accounts/:id/reconcile
Registrar conciliação de saldo.

---

## Categories

### POST /api/v1/categories
Criar categoria.

### GET /api/v1/categories
Listar categorias.

### GET /api/v1/categories/defaults
Listar categorias padrão.

### PUT /api/v1/categories/:id
Atualizar categoria.

### DELETE /api/v1/categories/:id
Excluir categoria.

### POST /api/v1/categories/rules
Criar regra automática.

### GET /api/v1/categories/rules
Listar regras.

### PUT /api/v1/categories/rules/:id
Editar regra.

### DELETE /api/v1/categories/rules/:id
Excluir regra.

---

## Transactions

### POST /api/v1/transactions
Criar transação manual.

### GET /api/v1/transactions
Listar transações com filtros.

Filtros:
- start_date
- end_date
- account_id
- category_id
- type
- min_amount
- max_amount

### GET /api/v1/transactions/:id
Detalhar transação.

### PUT /api/v1/transactions/:id
Editar transação.

### DELETE /api/v1/transactions/:id
Excluir transação.

### POST /api/v1/transactions/:id/duplicate
Duplicar transação.

### POST /api/v1/transactions/transfer
Criar transferência entre contas.

### POST /api/v1/transactions/installments
Criar despesa parcelada.

### GET /api/v1/transactions/:id/audit
Ver histórico de alterações.

---

## Recurring Transactions

### POST /api/v1/recurrences
Criar recorrência.

### GET /api/v1/recurrences
Listar recorrências.

### PUT /api/v1/recurrences/:id
Editar recorrência.

### PATCH /api/v1/recurrences/:id/pause
Pausar recorrência.

### PATCH /api/v1/recurrences/:id/cancel
Cancelar recorrência.

---

## Imports

### POST /api/v1/imports
Importar extrato CSV, OFX ou PDF.

### GET /api/v1/imports
Listar importações.

### GET /api/v1/imports/:id/preview
Pré-visualizar transações importadas.

### POST /api/v1/imports/:id/confirm
Confirmar importação.

### DELETE /api/v1/imports/:id
Cancelar importação.

---

## Open Finance

### POST /api/v1/open-finance/connections
Criar conexão com instituição financeira.

### GET /api/v1/open-finance/connections
Listar conexões.

### DELETE /api/v1/open-finance/connections/:id
Revogar conexão.

### POST /api/v1/open-finance/connections/:id/sync
Sincronizar transações.

### GET /api/v1/open-finance/connections/:id/status
Ver status da conexão.

---

## AI

### POST /api/v1/ai/categorize
Sugerir categoria para transação.

### POST /api/v1/ai/categorize/batch
Sugerir categorias em lote.

### POST /api/v1/ai/chats
Criar conversa.

### GET /api/v1/ai/chats
Listar conversas.

### GET /api/v1/ai/chats/:id
Buscar conversa.

### POST /api/v1/ai/chats/:id/messages
Enviar pergunta ao assistente financeiro.

### GET /api/v1/ai/cashflow-forecast
Gerar previsão de fluxo de caixa.

Query:
- period=30|60|90

### POST /api/v1/ai/simulations
Simular cenários financeiros.

### GET /api/v1/ai/recommendations
Listar recomendações inteligentes.

---

## Dashboard

### GET /api/v1/dashboard/summary
Resumo financeiro geral.

### GET /api/v1/dashboard/charts/expenses-by-category
Gráfico de gastos por categoria.

### GET /api/v1/dashboard/charts/income-vs-expense
Receitas vs despesas.

### GET /api/v1/dashboard/charts/balance-history
Saldo ao longo do tempo.

### GET /api/v1/dashboard/widgets
Listar widgets do usuário.

### PUT /api/v1/dashboard/widgets
Atualizar organização dos widgets.

---

## Bills

### POST /api/v1/bills
Criar conta a pagar ou receber.

### GET /api/v1/bills
Listar contas com filtros.

### GET /api/v1/bills/:id
Detalhar conta.

### PUT /api/v1/bills/:id
Editar conta.

### DELETE /api/v1/bills/:id
Excluir conta.

### POST /api/v1/bills/:id/pay
Registrar pagamento ou recebimento.

### POST /api/v1/bills/:id/partial-payment
Registrar pagamento parcial.

---

## Budgets

### POST /api/v1/budgets
Criar orçamento.

### GET /api/v1/budgets
Listar orçamentos.

### GET /api/v1/budgets/:id/progress
Ver progresso do orçamento.

### PUT /api/v1/budgets/:id
Editar orçamento.

### DELETE /api/v1/budgets/:id
Excluir orçamento.

---

## Reports

### GET /api/v1/reports/dre
Gerar DRE simplificado.

### GET /api/v1/reports/cashflow
Gerar relatório de fluxo de caixa.

### GET /api/v1/reports/categories
Gerar relatório por categoria.

### GET /api/v1/reports/export/pdf
Exportar relatório em PDF.

### GET /api/v1/reports/export/xlsx
Exportar relatório em Excel.

### GET /api/v1/reports/export/csv
Exportar transações em CSV.

---

## Goals

### POST /api/v1/goals
Criar meta financeira.

### GET /api/v1/goals
Listar metas.

### GET /api/v1/goals/:id
Detalhar meta.

### PUT /api/v1/goals/:id
Editar meta.

### DELETE /api/v1/goals/:id
Excluir meta.

### POST /api/v1/goals/:id/contributions
Registrar aporte.

### GET /api/v1/goals/:id/progress
Ver progresso da meta.

### GET /api/v1/goals/:id/ai-suggestion
Sugestão da IA para aporte ideal.

---

## Contacts

### POST /api/v1/contacts
Criar contato.

### GET /api/v1/contacts
Listar contatos.

### GET /api/v1/contacts/:id
Detalhar contato.

### PUT /api/v1/contacts/:id
Editar contato.

### DELETE /api/v1/contacts/:id
Excluir contato.

### GET /api/v1/contacts/:id/history
Histórico financeiro do contato.

---

## Licenses

### GET /api/v1/licenses/me
Ver status da licença.

### POST /api/v1/licenses/checkout
Criar checkout para compra.

### POST /api/v1/licenses/webhook
Receber webhook do gateway de pagamento.

### POST /api/v1/licenses/activate
Ativar licença após pagamento.

---

## Notifications

### GET /api/v1/notifications
Listar notificações.

### PATCH /api/v1/notifications/:id/read
Marcar como lida.

### PATCH /api/v1/notifications/read-all
Marcar todas como lidas.

### PUT /api/v1/notifications/preferences
Atualizar preferências de alerta.

---

## Segurança

- Todas as rotas privadas devem exigir JWT.
- Senhas devem ser armazenadas com hash bcrypt ou argon2.
- Bloquear login após 5 tentativas incorretas.
- Validar entrada de dados em todos os endpoints.
- Aplicar rate limit em login, recuperação de senha e IA.
- Nunca retornar mensagens revelando se e-mail existe ou não.
- Garantir que todo acesso seja filtrado por user_id.
- Usar HTTPS em produção.
- Usar CORS configurado por ambiente.

## Dockerização do backend

O projeto deve ser dockerizado com:

- Dockerfile para API Golang
- docker-compose.yml com backend e PostgreSQL
- Variáveis em .env
- Healthcheck do banco
- Migrations executadas no start ou em comando separado

Serviços mínimos:

- app
- postgres

Variáveis sugeridas:

APP_PORT=8080
DATABASE_URL=postgres://finance_user:finance_password@postgres:5432/finance_app?sslmode=disable
JWT_SECRET=change_me
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
AI_PROVIDER=
AI_API_KEY=

## Critério de pronto

A skill será considerada concluída quando:

- O banco possuir migrations iniciais.
- A API subir via Docker Compose.
- O backend conectar no PostgreSQL.
- Os módulos principais tiverem endpoints definidos.
- As rotas privadas usarem autenticação JWT.
- O projeto estiver preparado para integração com Lovable no frontend.