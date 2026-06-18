# Prompt 06 — Orçamento por Categoria

> Pré-requisito: Prompts 00 e 02 aplicados.

---

## PROMPT PARA O LOVABLE

```
Implemente a página de Orçamento por Categoria do FinanceAI (/orcamento).

## Header da página

Título: "Orçamento"
Subtítulo: "Junho 2025 · R$ 8.760 gastos de R$ 11.500 orçados (76,2%)"
Ações:
  - Seletor de mês (anterior/próximo + mês atual)
  - Botão "+ Novo orçamento" (blue-600)

## Card de resumo geral (topo, full width)

Barra de progresso geral (grossa, 12px):
  Gasto total: R$ 8.760 de R$ 11.500 (76,2%)
  Cor: âmbar (pois entre 75-99%)
  Legenda: "Restam R$ 2.740 para gastar até 30/06 · 12 dias restantes"

3 mini-stats abaixo:
  · "Categorias ok": 6 (verde)
  · "Atenção (>75%)": 2 (âmbar)
  · "Ultrapassadas": 1 (vermelho)

## Grid de cards de orçamento (3 colunas)

Cada card contém:
  - Emoji + nome da categoria (H3)
  - Valor gasto / valor orçado (font-mono)
  - Barra de progresso colorida por nível:
    · < 75%  → azul (bg-blue-500)
    · 75-99% → âmbar (bg-amber-500)
    · ≥ 100% → vermelho (bg-red-500)
  - Percentual e "R$ X restantes" abaixo da barra
  - Ícones de ação no hover: ✏️ editar | 🗑️ excluir

Dados mockados (8 categorias):

  🍕 Alimentação
  Gasto: R$ 1.820 / Orçamento: R$ 1.500 (121% — ULTRAPASSADO)
  Cor: vermelha | Badge "Ultrapassado" em red-100 text-red-700
  "⚠️ R$ 320 acima do limite"

  🏠 Moradia
  Gasto: R$ 2.287 / Orçamento: R$ 2.500 (91,5%)
  Cor: âmbar | Badge "Atenção"

  🚗 Transporte
  Gasto: R$ 680 / Orçamento: R$ 900 (75,6%)
  Cor: âmbar | Badge "Atenção"

  💊 Saúde
  Gasto: R$ 420 / Orçamento: R$ 800 (52,5%)
  Cor: azul | Badge "No prazo"

  🎮 Lazer
  Gasto: R$ 590 / Orçamento: R$ 1.000 (59%)
  Cor: azul | Badge "No prazo"

  📚 Educação
  Gasto: R$ 0 / Orçamento: R$ 500 (0%)
  Cor: azul | Estado vazio com "Nenhum gasto nesta categoria"

  💡 Contas Fixas
  Gasto: R$ 1.840 / Orçamento: R$ 2.000 (92%)
  Cor: âmbar | Badge "Atenção"

  🛍️ Outros
  Gasto: R$ 1.123 / Orçamento: R$ 1.800 (62,4%)
  Cor: azul | Badge "No prazo"

## Seção inferior — Comparativo (tabela)

Título: "Detalhamento por categoria"
Tabs: "Este mês | Últimos 3 meses | Últimos 6 meses"

Tabela:
  Categoria | Orçado | Gasto | Restante | % Utilizado | Tendência

  Alimentação · R$ 1.500 · R$ 1.820 · -R$ 320 · 121% · ↑ piorando (seta vermelha)
  Moradia      · R$ 2.500 · R$ 2.287 ·  R$ 213 · 91%  · → estável (cinza)
  Transporte   · R$ 900   · R$ 680   ·  R$ 220 · 76%  · ↑ piorando (âmbar)
  Saúde        · R$ 800   · R$ 420   ·  R$ 380 · 53%  · ↓ melhorando (verde)
  ...

  Rodapé da tabela: TOTAL · R$ 11.500 · R$ 8.760 · R$ 2.740 · 76,2%

## Modal: Novo / Editar Orçamento

Dialog centralizado (max-w-md):

  Título: "Definir orçamento"

  Campos:
  · Select "Categoria" (com ícone emoji)
  · Input "Valor limite mensal" (R$, obrigatório)
  · Radio "Tipo de orçamento":
    · "Fixo para este mês"
    · "Recorrente (todo mês)"
  · Toggle "Alertar quando atingir 80%"
  · Toggle "Alertar quando ultrapassar"

  Preview em tempo real:
  Card mostrando como ficará a barra com o valor digitado
  "Com R$ X de orçamento e R$ Y gastos, você teria Z% utilizado."

  Footer:
  · "Cancelar" + "Salvar orçamento" (blue-600)

## Alerta inline (quando categoria é ultrapassada)

Banner no topo da página:
  🔴 "A categoria Alimentação ultrapassou o orçamento em R$ 320,00.
  A IA identificou que pedidos de delivery representam 23% desse gasto.
  [Ver recomendações da IA]  [Ajustar orçamento]"
```
