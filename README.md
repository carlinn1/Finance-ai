# Finance AI

Aplicação web de gestão financeira pessoal e empresarial com recursos de inteligência artificial. O projeto reúne controle de receitas e despesas, contas a pagar e receber, orçamentos, metas, relatórios e previsões financeiras em uma interface responsiva.

![Finance AI](public/assets/financeai-wordmark.png)

## Funcionalidades

- Landing page com apresentação do produto, recursos e planos
- Login, cadastro, recuperação de senha e verificação 2FA
- Dashboard com indicadores, gráficos e alertas financeiros
- Cadastro, filtros, importação e gestão de transações
- Controle de contas a pagar e receber
- Orçamentos mensais por categoria
- Metas financeiras e acompanhamento de progresso
- Relatórios DRE, fluxo por categoria e evolução anual
- Assistente financeiro com previsões e recomendações
- Configurações de perfil, foto, alertas, licença e segurança
- Layout responsivo com sidebar recolhível e navegação mobile

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Recharts
- Lucide React

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Instalação

```bash
git clone <URL_DO_REPOSITORIO>
cd Finance-AI
npm install
npm run dev
```

No PowerShell, caso a política de execução bloqueie `npm.ps1`, utilize:

```powershell
npm.cmd install
npm.cmd run dev
```

A aplicação ficará disponível normalmente em `http://localhost:5173`.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # valida o TypeScript e gera o build de produção
npm run preview  # serve localmente o build de produção
```

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Landing page |
| `/login` | Autenticação |
| `/register` | Criação de conta |
| `/dashboard` | Visão financeira geral |
| `/transacoes` | Gestão de transações |
| `/contas-pagar-receber` | Contas a pagar e receber |
| `/orcamento` | Orçamento por categoria |
| `/metas` | Metas financeiras |
| `/relatorios` | Relatórios financeiros |
| `/ia` | Assistente financeiro |
| `/configuracoes` | Perfil, segurança e licença |

## Estrutura

```text
src/
  components/   Componentes compartilhados e feedback visual
  data/         Dados mockados para desenvolvimento
  layout/       Layout autenticado e navegação
  lib/          Formatação e utilitários locais
  pages/        Páginas e fluxos da aplicação
public/assets/  Logos e imagens públicas
Docs/           Requisitos e especificações do projeto
```

## Persistência e backend

O frontend utiliza dados mockados e estado local enquanto a API está em desenvolvimento. A foto de perfil é armazenada temporariamente no `localStorage` e já está preparada para futura sincronização com o backend.

A arquitetura planejada utiliza:

- Golang para API REST
- PostgreSQL para persistência
- JWT, OAuth 2.0 e TOTP para autenticação
- Docker e Docker Compose para infraestrutura local

## Build

O projeto possui build de produção validado com TypeScript e Vite:

```bash
npm run build
```

## Repositório

Projeto privado: **Finance-AI**.
