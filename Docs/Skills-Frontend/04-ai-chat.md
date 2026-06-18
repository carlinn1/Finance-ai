# Prompt 04 — IA Assistente

> Pré-requisito: Prompts 00 e 02 aplicados.

---

## PROMPT PARA O LOVABLE

```
Implemente a página do Assistente de IA do FinanceAI (/ia).
Esta tela tem dois painéis: chat à esquerda e insights à direita.

## Layout da página (sem header padrão — tela cheia exceto sidebar)

Dois painéis lado a lado, altura 100% da viewport:
  - Painel esquerdo (55%): Chat com IA
  - Painel direito (45%): Painel de Insights

## Painel Esquerdo — Chat IA

Header fixo:
  · Ícone Sparkles azul + "FinanceAI Assistente"
  · Subtítulo "Pergunte qualquer coisa sobre suas finanças"
  · Botão "Nova conversa" (ghost, ícone RotateCcw)

Área de mensagens (scroll):
  Simular histórico com 4 mensagens:

  [Usuário] "Quanto gastei com alimentação em maio comparado com junho?"

  [IA - bubble azul claro, fundo blue-50, borda blue-200]:
    "Boa pergunta! Aqui está a comparação de Alimentação:

    📊 Maio 2025: R$ 1.620,40 (12 transações)
    📊 Junho 2025: R$ 1.820,00 (9 transações — até hoje)

    ↑ Aumento de R$ 199,60 (+12,3%) em junho, e o mês ainda não acabou.
    Projetando o ritmo atual, você deve fechar junho com cerca de R$ 2.100,
    que ultrapassa o seu orçamento de R$ 1.500 definido para a categoria.

    Quer que eu sugira formas de reduzir os gastos com alimentação?"

  [Usuário] "Sim, me dê sugestões"

  [IA]:
    "Claro! Analisando seus padrões, identifiquei algumas oportunidades:

    1. 🛒 Supermercado — Você faz compras em média 3x por semana em valores
       menores. Consolidar em 1-2 compras semanais maiores tende a reduzir
       gastos impulsivos.

    2. 📱 Apps de delivery (iFood) — R$ 420,00 em junho (23% da categoria).
       Reduzir de 5 para 2 pedidos/semana economizaria ~R$ 250/mês.

    3. ☕ Cafés e padarias — R$ 180,00 este mês. Uma cafeteira em casa
       se paga em 2 meses.

    Quer criar uma meta de economia específica para alimentação?"

  [IA - com loading spinner]:
    Mostrar estado de "digitando..." com 3 pontos animados

Input de mensagem (fixo no rodapé):
  · Textarea expandível "Pergunte algo sobre suas finanças..."
    (exemplos rotativos como placeholder a cada 3s):
    "Quanto gastei este mês?"
    "Vou conseguir pagar minhas contas?"
    "Como está meu fluxo de caixa?"
  · Botão enviar (blue-600, ícone Send)
  · Sugestões de perguntas rápidas acima do input (chips clicáveis):
    "📊 Resumo do mês"  |  "⚠️ Contas vencendo"  |  "🎯 Status das metas"
    "📈 Maior gasto"    |  "💡 Recomendações"

## Painel Direito — Insights

Tab navigation: "Previsão | Alertas | Relatório IA"

### Tab 1: Previsão de Fluxo de Caixa

Título: "Previsão — próximos 60 dias" + badge "Atualizado pela IA"

Gráfico de área (Recharts AreaChart):
  - X: datas dos próximos 60 dias (semanal)
  - Y: saldo previsto
  - 3 linhas com área preenchida:
    · "Otimista" (emerald-300, pontilhada)
    · "Realista" (blue-500, sólida, destaque)
    · "Pessimista" (red-300, pontilhada)
  - Linha horizontal "Saldo mínimo recomendado: R$ 5.000" (âmbar, tracejada)
  - Área abaixo do mínimo em red com opacity 0.05

Dados mockados (saldo realista):
  Hoje(18/06): 21.279
  25/06: 19.800
  02/07: 23.200 (salário)
  09/07: 20.100
  16/07: 24.500 (salário)
  23/07: 21.800
  09/08: 25.200 (salário)

Abaixo do gráfico:
  3 mini-cards informativos:
  · "Saldo em 30 dias (realista)": R$ 24.500
  · "Menor saldo previsto": R$ 19.200 em 23/06
  · "Contas a vencer (30d)": R$ 4.840

### Tab 2: Alertas Inteligentes

Lista de alertas com prioridade visual:

🔴 CRÍTICO — "Orçamento de Alimentação ultrapassado"
   "Você gastou R$ 1.820 de R$ 1.500 orçados.
    21% acima do limite. O mês ainda não acabou."
   [Botão "Ver detalhes"]

🟡 ATENÇÃO — "Conta vence em 3 dias"
   "Aluguel de R$ 2.100,00 vence em 21/06.
    Saldo atual na conta: R$ 8.420,50 ✓"
   [Botão "Ver conta"]

🟡 ATENÇÃO — "Gasto incomum detectado"
   "Categoria Transporte +45% vs. média dos últimos 3 meses."
   [Botão "Ver transações"]

🟢 DICA — "Oportunidade de economia"
   "Você tem 3 assinaturas de streaming (R$ 133,70/mês).
    Reduzir para 2 economizaria ~R$ 55/mês = R$ 660/ano."
   [Botão "Ver assinaturas"]

🔵 INFO — "Meta no bom caminho"
   "Reserva de emergência 68% concluída.
    No ritmo atual, conclui em fevereiro/2026."
   [Botão "Ver meta"]

### Tab 3: Relatório IA

Card com texto gerado pela IA (estilo "análise do consultor"):

Título: "📋 Análise Financeira — Junho 2025"
Gerado em: "18/06/2025 às 14:32 · por FinanceAI"

Texto:
"**Situação Geral:** Sua saúde financeira em junho está **positiva**, com resultado
de R$ 3.739,70 e taxa de poupança de 29,9% — acima da meta recomendada de 20%.

**Pontos de atenção:**
Alimentação ultrapassou o orçamento em 21% e demanda ajuste antes do fim do mês.
Transporte apresentou variação incomum, sugerindo revisão.

**Destaques positivos:**
A receita cresceu 8,3% vs. maio, impulsionada pelo freelance de R$ 2.000.
Sua reserva de emergência cresce no ritmo certo.

**Recomendação principal:**
Manter o orçamento atual de R$ 1.500 em alimentação e ajustar
comportamento até 30/06 para evitar estourar o limite anual."

Botão "Exportar relatório em PDF" (outline, ícone Download)
```
