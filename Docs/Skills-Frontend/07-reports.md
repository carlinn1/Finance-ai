# Prompt 07 — Relatórios Financeiros

> Pré-requisito: Prompts 00 e 02 aplicados.

---

## PROMPT PARA O LOVABLE

```
Implemente a página de Relatórios do FinanceAI (/relatorios).

## Header da página

Título: "Relatórios"
Subtítulo: "Análises e demonstrativos financeiros"
Ações:
  - Seletor de período: "Junho 2025" (mês/ano com picker)
  - Botão "Exportar PDF" (ícone Download, outline)
  - Botão "Exportar Excel" (ícone FileSpreadsheet, outline)

## Tabs principais

"DRE | Fluxo de Caixa | Por Categoria | Evolução Anual"

---

### Tab 1: DRE — Demonstrativo de Resultado

Subtítulo: "Competência: Junho 2025 · Caixa: Junho 2025"

Tabela estilo DRE contábil:

  ┌─────────────────────────────────────────────────────────────┐
  │ RECEITAS                                        R$ 12.500,00│
  ├─────────────────────────────────────────────────────────────┤
  │   Salário                           R$ 8.500,00            │
  │   Freelance / Consultoria           R$ 2.000,00            │
  │   Outras Receitas                   R$ 2.000,00            │
  ├─────────────────────────────────────────────────────────────┤
  │ DESPESAS OPERACIONAIS               (R$ 8.760,30)          │
  ├─────────────────────────────────────────────────────────────┤
  │   Moradia                           (R$ 2.287,40)          │
  │   Alimentação                       (R$ 1.820,00)          │
  │   Contas Fixas                      (R$ 1.840,00)          │
  │   Transporte                        (R$ 680,00)            │
  │   Saúde                             (R$ 420,00)            │
  │   Lazer                             (R$ 590,00)            │
  │   Outros                            (R$ 1.122,90)          │
  ├─────────────────────────────────────────────────────────────┤
  │ RESULTADO DO PERÍODO                R$ 3.739,70 ✅         │
  ├─────────────────────────────────────────────────────────────┤
  │   Margem de economia: 29,9%                                │
  └─────────────────────────────────────────────────────────────┘

Design:
  - Headers de seção: bg-slate-100, font-semibold
  - Resultado positivo: texto emerald-600, bold
  - Resultado negativo: texto red-600, bold
  - Linhas zebradas sutis
  - Valores em font-mono alinhados à direita
  - Clique em qualquer linha → expande transações do grupo

Comparativo ao lado (coluna extra):
  "Mês anterior (Mai)" com variação percentual em badge colorido

### Tab 2: Fluxo de Caixa

Dois sub-tabs: "Realizado | Projetado"

#### Realizado

Gráfico de barras empilhadas + linha de saldo:
  - Eixo X: dias do mês (agrupado por semana)
  - Barras positivas (verde): entradas do período
  - Barras negativas (vermelho): saídas do período
  - Linha sobre as barras (azul): saldo acumulado

Abaixo do gráfico, tabela por período (semanal):

  Semana     | Entradas   | Saídas     | Saldo do período | Saldo acumulado
  01-07 jun  | R$ 0       | R$ 2.287   | -R$ 2.287        | R$ 18.993
  08-14 jun  | R$ 8.500   | R$ 2.134   | +R$ 6.366        | R$ 25.359
  15-21 jun  | R$ 0       | R$ 2.840   | -R$ 2.840        | R$ 22.519
  22-30 jun  | R$ 4.000   | R$ 1.499   | +R$ 2.501        | R$ 25.020 (projetado)

#### Projetado

Mesmo gráfico mas com dados futuros (tracejados / semi-transparentes)
Legenda: "Realizado" (sólido) vs "Projetado pela IA" (tracejado)

### Tab 3: Por Categoria

Layout: Gráfico treemap ou barras horizontais + tabela

Gráfico de barras horizontais (Recharts HorizontalBar):
  - 1 barra por categoria
  - Largura proporcional ao valor
  - Cor da categoria
  - Valor à direita

Abaixo, tabela detalhada:
  Categoria | Nº Trans. | Total Gasto | % do Total | vs. Mês Ant. | Maior gasto

  Moradia     |  3  | R$ 2.287 | 26,1% | +2%   | Aluguel R$ 2.100
  Alimentação |  9  | R$ 1.820 | 20,8% | +12%↑ | Supermercado R$ 234
  ...

Clique em qualquer categoria → abre painel lateral com as transações da categoria

### Tab 4: Evolução Anual

Gráfico de linha (Recharts LineChart) mostrando 12 meses:
  - 3 linhas: Receita (verde), Despesa (vermelha), Resultado (azul)
  - Meses futuros em tracejado
  - Tooltip com os 3 valores ao hover

Tabela anual abaixo:
  Mês  | Receita    | Despesa    | Resultado  | Economia%
  Jan  | R$ 10.200  | R$ 8.100   | R$ 2.100   | 20,6%
  Fev  | R$ 9.800   | R$ 7.600   | R$ 2.200   | 22,4%
  Mar  | R$ 11.500  | R$ 9.200   | R$ 2.300   | 20,0%
  Abr  | R$ 12.000  | R$ 8.400   | R$ 3.600   | 30,0%
  Mai  | R$ 11.800  | R$ 7.900   | R$ 3.900   | 33,1%
  Jun  | R$ 12.500  | R$ 8.760   | R$ 3.740   | 29,9%
  ──────────────────────────────────────────────────────
  Tot  | R$ 67.800  | R$ 49.960  | R$ 17.840  | 26,3%

## Rodapé da página

Banner azul claro:
  "💡 Este relatório foi gerado com base em 42 transações de junho.
   Quer um relatório mais detalhado? Pergunte para o IA Assistente →"
```
