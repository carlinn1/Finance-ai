# Prompt 08 — Metas Financeiras

> Pré-requisito: Prompts 00 e 02 aplicados.

---

## PROMPT PARA O LOVABLE

```
Implemente a página de Metas Financeiras do FinanceAI (/metas).

## Header da página

Título: "Metas Financeiras"
Subtítulo: "3 metas ativas · 1 concluída"
Ações:
  - Botão "+ Nova meta" (blue-600, ícone Plus)

## Cards de resumo (topo, 3 cards em linha)

  Total almejado: R$ 42.000,00 (soma de todas as metas)
  Total acumulado: R$ 21.470,00 (51,1%)
  Metas no prazo: 2 de 3 (badge verde "2 ✓ | 1 ⚠️")

## Grid de metas ativas (2 colunas)

### Card: Reserva de Emergência 🛡️

  Header do card:
    Emoji + "Reserva de Emergência" (H2)
    Badge "No prazo" (emerald)
    Ícone de menu (3 pontos) → editar / arquivar / excluir

  Valor central em destaque:
    "R$ 13.600" (acumulado, blue-600, font-mono, 28px)
    "de R$ 20.000" (texto menor, slate-500)

  Barra de progresso (grossa, 16px, azul):
    68% preenchido → "68%"

  Grid de 3 stats abaixo da barra:
    📅 Prazo: Dezembro/2025
    💰 Aporte mensal: R$ 800
    🕐 Previsão: Fevereiro/2026

  Alerta da IA (se atrasado):
    (esta meta está no prazo, então mostrar dica positiva)
    "💡 No ritmo atual, você conclui esta meta 2 meses após o prazo.
     Aumentar o aporte para R$ 1.080/mês garantiria chegar em dezembro."

  Últimos aportes (mini-lista):
    · 01/06 → R$ 800,00
    · 01/05 → R$ 800,00
    · 01/04 → R$ 800,00
    [Ver histórico completo]

  Footer do card:
    Botão "+ Registrar aporte" (outline, full width)

---

### Card: Viagem para Europa ✈️

  Badge "Atenção" (âmbar) — pois está atrasado

  Valor: "R$ 5.870" de "R$ 18.000"
  Barra: 32,6% (âmbar)

  Stats:
    📅 Prazo: Julho/2026
    💰 Aporte mensal: R$ 400
    🕐 Previsão: Março/2027 (8 meses de atraso!)

  Alerta da IA (vermelho/âmbar):
    "⚠️ No ritmo atual, você não vai atingir esta meta no prazo.
     Para chegar em julho/2026, precisaria de R$ 920/mês.
     [Ver simulação completa]"

  Botão "+ Registrar aporte"

---

### Card: Notebook Novo 💻

  Badge "No prazo" (emerald)

  Valor: "R$ 2.000" de "R$ 4.000"
  Barra: 50% (azul)

  Stats:
    📅 Prazo: Setembro/2025
    💰 Aporte mensal: R$ 500
    🕐 Previsão: Setembro/2025 (exato!)

  Mensagem positiva da IA:
    "✅ Perfeito! Você está exatamente no ritmo para comprar em setembro."

  Botão "+ Registrar aporte"

---

### Card: Meta Concluída — Fundo de Férias 🏖️ (tom cinza/opaco)

  Badge "Concluída" (slate)
  "R$ 6.000 / R$ 6.000 · 100% ✓"
  "Concluída em 15/05/2025"

  Barra cheia em emerald
  Botão "Ver histórico" (ghost)

---

## Modal: Nova Meta

Drawer lateral (420px):

  Header: "Nova meta financeira" + ícone Target

  Campos:
  · Emoji picker + Input "Nome da meta"
  · Input "Valor alvo" (R$, obrigatório)
  · Date picker "Prazo para conclusão"
  · Select "Conta de destino" (onde o dinheiro ficará)
  · Input "Valor já acumulado" (opcional, para metas em andamento)
  · Input "Aporte mensal planejado" (R$)

  Preview em tempo real da IA:
  Card ao vivo:
    "Com R$ X de meta, R$ Y já acumulados e R$ Z/mês de aporte:
     ✅ Você concluirá em [data calculada]
     ou
     ⚠️ Você precisaria de R$ W/mês para concluir no prazo."

  · Textarea "Por que esta meta é importante para você?" (opcional, 200 chars)

  · Toggle "Aporte automático mensal"
    Se ativo: "Criar lançamento recorrente de R$ X todo dia [1] do mês"

  Footer:
  · "Cancelar" + "Criar meta" (blue-600)

## Modal: Registrar Aporte

Dialog pequeno (max-w-sm):

  Título: "Registrar aporte — Reserva de Emergência"
  "Aporte acumulado atual: R$ 13.600,00"

  Campos:
  · Input "Valor do aporte" (R$, padrão = aporte mensal planejado R$ 800)
  · Date picker "Data" (padrão hoje)
  · Select "Conta de origem"
  · Textarea "Observação" (opcional)

  Preview após aporte:
  "Após este aporte: R$ 14.400,00 (72%) — R$ 5.600,00 restantes"

  Botão "Confirmar aporte" (blue-600, full width)

## Estado vazio (nenhuma meta cadastrada)

  Ícone Target grande em slate-300 centralizado
  "Comece a planejar seu futuro"
  "Crie sua primeira meta financeira e acompanhe o progresso com ajuda da IA."
  Botão "+ Criar primeira meta" (blue-600, large)

  Sugestões de metas comuns (chips clicáveis):
  🛡️ Reserva de emergência  ✈️ Viagem  🏠 Entrada do imóvel
  🚗 Veículo  📚 Educação  💰 Aposentadoria
```
