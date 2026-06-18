# Prompt 02 — Dashboard Principal

> Pré-requisito: Prompt 00 aplicado.

---

## PROMPT PARA O LOVABLE

```
Implemente o Dashboard principal do FinanceAI (/dashboard).
Este é o coração do app — deve transmitir controle e clareza de um relance.

## Header da página

Título: "Dashboard"
Subtítulo: "Junho 2025 · Atualizado há 2 min"
Ações à direita:
  - Seletor de período: dropdown com "Este mês | Último mês | Este ano | Custom"
  - Botão "Atualizar" (ícone RefreshCw, variante ghost)

## Seção 1 — Cards KPI (4 cards em grid 4 colunas)

Card 1 — Saldo Total:
  valor: R$ 21.279,70
  ícone: Wallet (blue-600)
  rodapé: "3 contas ativas"
  sem variação percentual

Card 2 — Receitas do Mês:
  valor: R$ 12.500,00
  ícone: TrendingUp (emerald-600)
  variação: "+8,3% vs mês anterior" (badge verde)
  rodapé: "7 lançamentos"

Card 3 — Despesas do Mês:
  valor: R$ 8.760,30
  ícone: TrendingDown (red-600)
  variação: "+12,1% vs mês anterior" (badge vermelho)
  rodapé: "34 lançamentos"

Card 4 — Resultado do Mês:
  valor: R$ 3.739,70
  ícone: BarChart3 (blue-600)
  variação: "-2,1% vs mês anterior" (badge vermelho pois piorou)
  rodapé: "Taxa de economia: 29,9%"

## Seção 2 — Linha com dois gráficos

Gráfico 1 (60% da largura) — "Evolução Mensal":
  Tipo: BarChart (barras agrupadas Recharts)
  Dados dos últimos 6 meses:
    Jan: receita 10200, despesa 8100
    Fev: receita 9800,  despesa 7600
    Mar: receita 11500, despesa 9200
    Abr: receita 12000, despesa 8400
    Mai: receita 11800, despesa 7900
    Jun: receita 12500, despesa 8760
  Barras: receita em emerald-500, despesa em red-400
  Legenda abaixo, tooltip em português, valores em R$

Gráfico 2 (40% da largura) — "Gastos por Categoria":
  Tipo: DonutChart (PieChart Recharts com innerRadius)
  Dados junho:
    Alimentação: R$ 1.820 (cor #F59E0B)
    Moradia:     R$ 2.100 (cor #8B5CF6)
    Transporte:  R$ 680  (cor #3B82F6)
    Saúde:       R$ 420  (cor #10B981)
    Lazer:       R$ 590  (cor #EC4899)
    Outros:      R$ 1.150 (cor #94A3B8)
  Centro do donut: valor total "R$ 6.760"
  Legenda à direita com valor e percentual de cada categoria

## Seção 3 — Linha com três painéis

Painel 1 (40% da largura) — "Próximos Vencimentos":
  Header: "Próximos vencimentos" + link "Ver todos →"
  Lista de 5 itens, cada um com:
    - Ícone de categoria (colorido)
    - Nome do lançamento
    - Data de vencimento
    - Valor em font-mono
    - Badge de status:
        · "Vence hoje"  → badge vermelho
        · "3 dias"      → badge âmbar
        · "7 dias"      → badge azul
  Itens mockados:
    · 💡 Energia Elétrica · hoje     · R$ 187,40 · badge vermelho
    · 🏠 Aluguel          · 3 dias   · R$ 2.100,00 · badge âmbar
    · 📱 Plano Celular    · 5 dias   · R$ 89,90 · badge azul
    · 🚗 Financiamento    · 8 dias   · R$ 650,00 · badge cinza
    · 💻 Spotify          · 12 dias  · R$ 21,90 · badge cinza

Painel 2 (30% da largura) — "Alertas da IA":
  Header: "Alertas Inteligentes" + ícone Sparkles azul
  3 alertas com ícone colorido, título e descrição curta:
    🔴 "Alimentação acima do limite"
       "Você gastou R$ 1.820 de R$ 1.500 orçados (+21%)"
    🟡 "Saldo baixo previsto"
       "Em 8 dias seu saldo pode cair para R$ 4.200"
    🟢 "Meta no prazo"
       "Reserva de emergência: 68% concluída"
  Botão "Ver recomendações completas" (link azul)

Painel 3 (30% da largura) — "Contas":
  Header: "Minhas Contas"
  Lista de contas com saldo:
    · Conta Corrente - Nubank  · R$ 8.420,50
    · Poupança - Caixa         · R$ 15.200,00
    · Cartão de Crédito Itaú   · -R$ 2.340,80 (em vermelho)
  Linha de separação
  "Saldo consolidado: R$ 21.279,70" em bold
  Botão "Adicionar conta" (ghost, ícone Plus)

## Seção 4 — Últimas Transações

Header: "Últimas Transações" + botão "Ver todas" (link)

Tabela com colunas:
  Descrição | Categoria | Conta | Data | Valor

5 transações mockadas:
  · "Supermercado Extra"    · Alimentação · Nubank    · 15/06 · -R$ 234,50
  · "Salário Junho"         · Salário     · Nubank    · 05/06 · +R$ 8.500,00
  · "Uber"                  · Transporte  · Cartão    · 14/06 · -R$ 28,90
  · "Farmácia Drogasil"     · Saúde       · Nubank    · 13/06 · -R$ 67,30
  · "Freelance - Cliente X" · Freelance   · Poupança  · 12/06 · +R$ 2.000,00

Valores positivos em emerald-600, negativos em red-600, ambos em font-mono.
Categoria com badge colorido (mesmas cores do donut acima).
Linha de tabela com hover:bg-slate-50.

## Interações

- Clicar em uma transação → abre drawer lateral com detalhes
- Clicar em "Ver todos" → navega para /transacoes
- Clicar em um alerta → abre modal com detalhes e recomendação da IA
- Hover nos gráficos → tooltip com valor formatado em R$
- Seletor de período → atualiza todos os dados da tela (simular com loading de 800ms)
```
