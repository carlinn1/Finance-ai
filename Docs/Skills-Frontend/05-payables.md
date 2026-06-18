# Prompt 05 — Contas a Pagar e Receber

> Pré-requisito: Prompts 00 e 02 aplicados.

---

## PROMPT PARA O LOVABLE

```
Implemente a página de Contas a Pagar e Receber do FinanceAI (/contas-pagar-receber).

## Header da página

Título: "Contas a Pagar e Receber"
Subtítulo: "Junho · A pagar: R$ 4.840,00 · A receber: R$ 2.000,00"
Ações:
  - Botão "+ Nova conta a pagar" (red-600 outline)
  - Botão "+ Nova conta a receber" (emerald-600)

## Cards de resumo (4 cards em linha)

  A Vencer (7 dias): R$ 2.374,90 · 3 contas · (âmbar)
  A Pagar (mês):     R$ 4.840,00 · 8 contas · (red-500)
  A Receber (mês):   R$ 2.000,00 · 2 contas · (emerald-600)
  Saldo Previsto:    -R$ 2.840,00 · (em vermelho, pois negativo)

## Tabs principais: "A Pagar (8) | A Receber (2) | Todas"

### Aba "A Pagar"

Filtros em linha:
  - Status: "Todas | Pendente | Vencido | Pago"
  - Período: date range
  - Categoria: dropdown

Lista de contas (card por item, não tabela):

  ─────────────────────────────────────────────
  🏠 Aluguel Junho                    PENDENTE
  Categoria: Moradia · Conta: Nubank
  Vencimento: 21/06/2025 · 3 dias    R$ 2.100,00
  [Baixar pagamento]  [Editar]  [Excluir]
  ─────────────────────────────────────────────
  ⚡ Energia Elétrica                   VENCIDO ← badge vermelho
  Categoria: Moradia · Conta: Nubank
  Venceu em: 18/06/2025 · HOJE      R$ 187,40
  [Baixar pagamento]  [Editar]  [Excluir]
  ─────────────────────────────────────────────
  📱 Plano Celular                    PENDENTE
  Categoria: Telecomunicações · Conta: Cartão
  Vencimento: 23/06/2025 · 5 dias    R$ 89,90
  [Baixar pagamento]  [Editar]  [Excluir]
  ─────────────────────────────────────────────
  🚗 Financiamento Carro              PENDENTE
  Categoria: Transporte · Conta: Nubank
  Vencimento: 26/06/2025 · 8 dias    R$ 650,00
  Parcela 18/48
  [Baixar pagamento]  [Editar]  [Excluir]
  ─────────────────────────────────────────────
  ✅ Netflix                            PAGO ← badge verde
  Categoria: Lazer · Conta: Cartão
  Pago em: 08/06/2025               R$ 55,90
  [Ver comprovante]   [Editar]  [Excluir]
  ─────────────────────────────────────────────

  Destaques visuais:
  · VENCIDO: borda esquerda red-500, fundo red-50 sutil
  · Vence hoje/amanhã: borda esquerda amber-500, fundo amber-50
  · PAGO: opacidade 60%, borda cinza

### Aba "A Receber"

Mesma estrutura, mas:
  - Badge "A RECEBER" em emerald
  - Botão "Confirmar recebimento" em vez de "Baixar pagamento"

  ─────────────────────────────────────────────
  💼 Freelance - Cliente A            PENDENTE
  Categoria: Freelance · Conta: Poupança
  Previsto para: 25/06/2025          R$ 2.000,00
  [Confirmar recebimento]  [Editar]  [Excluir]
  ─────────────────────────────────────────────
  ✅ Consultoria - Cliente B            RECEBIDO
  Categoria: Freelance · Conta: Poupança
  Recebido em: 05/06/2025           R$ 1.500,00
  [Ver comprovante]  [Editar]  [Excluir]
  ─────────────────────────────────────────────

## Modal: Baixar Pagamento / Confirmar Recebimento

Dialog centralizado (max-w-sm):
  Título: "Registrar pagamento"
  Ícone CreditCard em blue-600

  Campos:
  · "Conta a pagar": Aluguel Junho (readonly, em destaque)
  · "Valor original": R$ 2.100,00 (readonly)
  · "Valor pago" (editável, prefixo R$, padrão = valor original)
  · "Data do pagamento" (date picker, padrão hoje)
  · "Conta debitada" (select da conta a debitar)
  · Checkbox "Gerar comprovante"
  · Textarea "Observações" (opcional)

  Footer:
  · Botão "Cancelar"
  · Botão "Confirmar pagamento" (blue-600)

  Se valor pago < valor original, exibir aviso:
  "⚠️ Pagamento parcial. O saldo restante de R$ X ficará em aberto."

## Modal: Nova Conta a Pagar / Receber

Drawer lateral (380px):
  Título: "Nova conta a pagar" (ou receber)

  Campos:
  · Input "Descrição" (obrigatório)
  · Input "Valor" (obrigatório, R$)
  · Date picker "Vencimento"
  · Select "Categoria"
  · Select "Conta vinculada"
  · Select "Contato (Fornecedor/Cliente)" com opção de criar novo
  · Toggle "Recorrente"
    Se ativo:
      · Select "Repetir": Mensal | Trimestral | Anual
      · Input "Quantas vezes" (ou sem fim)
  · Input "Nº da nota / referência" (opcional)
  · Textarea "Observações"

  Footer:
  · "Cancelar" + "Salvar conta" (blue-600)
```
