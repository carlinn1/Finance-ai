# Finance AI

Aplicação de gestão financeira com frontend React, API REST em Go e PostgreSQL. O ambiente completo é executado com Docker Compose e os dados das telas vêm exclusivamente da API — não há seed de saldos ou lançamentos fictícios.

## Rodar frontend + backend + banco

Requisitos: Docker Desktop com Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

No PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Depois do healthcheck dos três serviços:

- Aplicação: http://localhost:3000
- API: http://localhost:8080/api/v1
- Healthcheck: http://localhost:8080/health
- PostgreSQL: `localhost:5432`

Na primeira execução, crie um usuário pela tela de cadastro. A migration é aplicada automaticamente pelo backend e somente as categorias padrão são criadas. Contas, saldos, lançamentos, metas e demais dados começam vazios.

Para encerrar:

```bash
docker compose down
```

Para também apagar o volume do banco e recomeçar do zero:

```bash
docker compose down -v
```

## Desenvolvimento local

### Frontend

Requer Node.js 20+ e uma API disponível na porta 8080.

```powershell
npm.cmd install
npm.cmd run dev
```

O Vite abre em http://localhost:5173 e encaminha `/api` para `http://localhost:8080`.

### Backend

Requer Go 1.23+ e PostgreSQL. É possível subir somente o banco com:

```bash
docker compose up postgres
```

Configure as variáveis e execute:

```powershell
$env:DATABASE_URL="postgres://finance_user:change_this_database_password@localhost:5432/finance_app?sslmode=disable"
$env:JWT_SECRET="uma-chave-local-com-pelo-menos-32-caracteres"
Set-Location backend
go run ./cmd/api
```

## Validação

```powershell
npm.cmd run build
cd backend
go test ./...
go vet ./...
```

## Estrutura

```text
backend/
  cmd/api/             inicialização da API
  internal/config/     configuração por ambiente
  internal/database/   pool PostgreSQL
  internal/httpapi/    módulos e handlers REST
  internal/security/   senha, JWT e tokens
  migrations/          schema SQL versionado
src/
  lib/api.ts           cliente HTTP e renovação de sessão
  pages/               telas integradas à API
docker-compose.yml     frontend + backend + PostgreSQL
```

## Segurança e operação

- Troque `JWT_SECRET` e `POSTGRES_PASSWORD` antes de produção.
- Senhas usam bcrypt; refresh tokens e tokens de recuperação são persistidos somente como hash.
- As rotas privadas validam JWT e todas as consultas financeiras filtram por usuário.
- O login bloqueia temporariamente após cinco falhas e as rotas sensíveis têm rate limit.
- O 2FA usa TOTP real e QR Code gerado no backend.
- O `AI_PROVIDER=local` usa o motor analítico sobre os dados do próprio usuário; nenhuma informação é enviada a terceiros.

## Integrações externas

O ambiente local funciona sem serviços pagos. OAuth Google/GitHub, envio de e-mail, gateway de licença e exportação PDF/XLSX ficam desativados até que os respectivos provedores e credenciais sejam definidos. A importação CSV e a exportação CSV já são funcionais. Em desenvolvimento, o link de recuperação de senha é emitido somente no log do backend, sem revelar no retorno da API se o e-mail existe.
