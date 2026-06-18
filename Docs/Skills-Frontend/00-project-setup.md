# Prompt 00 — Setup Inicial do Projeto

> Cole este prompt **primeiro** no Lovable antes de qualquer outro módulo.
> Ele estabelece a estrutura, design system e navegação de todo o app.

---

## PROMPT PARA O LOVABLE

```
Crie o projeto base de um app de gestão financeira pessoal e empresarial com IA,
chamado "FinanceAI", em React + TypeScript + Tailwind CSS + shadcn/ui.

## Stack e configuração

- React 18 + TypeScript + Vite
- Tailwind CSS com o design system abaixo
- shadcn/ui para todos os componentes de UI
- Recharts para gráficos
- lucide-react para ícones
- React Router DOM para navegação
- date-fns para formatação de datas
- Idioma: Português do Brasil (pt-BR)
- Moeda: BRL — formatar sempre como "R$ 1.234,56"

## Design System

Cores (adicionar ao tailwind.config):
  primary:   #2563EB (blue-600)
  positive:  #059669 (emerald-600)
  negative:  #DC2626 (red-600)
  warning:   #D97706 (amber-600)
  bg:        #F8FAFC (slate-50)

Tipografia:
  - Font: Inter (importar do Google Fonts)
  - Valores monetários: sempre em font-mono com tabular-nums

## Layout principal (AuthenticatedLayout)

Sidebar fixo à esquerda (240px), conteúdo principal com scroll à direita.

Sidebar deve conter:
  - Logo: ícone 💰 + texto "FinanceAI" em azul (topo)
  - Navegação principal com ícones (lucide-react):
    · Dashboard      → ícone LayoutDashboard
    · Transações     → ícone ArrowLeftRight
    · Contas         → ícone CreditCard
    · Orçamento      → ícone PieChart
    · Metas          → ícone Target
    · Relatórios     → ícone FileBarChart
    · IA Assistente  → ícone BotMessageSquare (badge "IA" em azul)
  - Separador
  - Configurações → ícone Settings
  - Avatar do usuário no rodapé: "JF" (iniciais), nome "João Ferreira",
    "Licença Completa" em badge verde

Estilo dos itens de nav:
  - Inativo: texto slate-600, hover bg-slate-100 rounded-lg
  - Ativo:   bg-blue-50 text-blue-600 font-medium rounded-lg

Header de cada página (dentro do conteúdo principal):
  - Título da página (H1 24px semibold)
  - Subtítulo opcional (slate-500)
  - Área de ações à direita (botões)
  - Separador abaixo

## Roteamento

Criar rotas para:
  /login                → LoginPage (sem sidebar)
  /register             → RegisterPage (sem sidebar)
  /dashboard            → DashboardPage
  /transacoes           → TransacoesPage
  /contas-pagar-receber → ContasPage
  /orcamento            → OrcamentoPage
  /metas                → MetasPage
  /relatorios           → RelatoriosPage
  /ia                   → IAPage
  /configuracoes        → ConfiguracoesPage

Redirecionar / para /dashboard.
Simular usuário já autenticado por padrão (sem lógica de auth real ainda).

## Componentes base para criar agora

1. Badge de status com variantes: positivo (verde), negativo (vermelho),
   aviso (âmbar), neutro (cinza), info (azul)

2. Card financeiro reutilizável com: título, valor em destaque (font-mono),
   variação percentual (+/-), ícone e cor configuráveis

3. Componente de valor monetário que formata "R$ 1.234,56" automaticamente,
   com prop `positive` (verde) e `negative` (vermelho) para colorir o valor

4. EmptyState reutilizável com ícone, título e subtítulo

5. LoadingSpinner centralizado

## Página inicial (Dashboard) — estrutura vazia

Criar o DashboardPage com apenas o título "Dashboard" e 4 cards de KPI
com dados mockados:
  - Saldo Total: R$ 21.279,70
  - Receitas do Mês: R$ 12.500,00 (verde, TrendingUp)
  - Despesas do Mês: R$ 8.760,30 (vermelho, TrendingDown)
  - Resultado: R$ 3.739,70 (verde, positivo)

As outras páginas podem ter apenas um placeholder "Em breve" por enquanto.
```
