# Prompt 03 — Gestão de Transações

> Pré-requisito: Prompts 00 e 02 aplicados.

---

## PROMPT PARA O LOVABLE

```
Implemente a página de Transações do FinanceAI (/transacoes).
Esta é a página mais usada do app — deve ser rápida, filtrável e clara.

## Header da página

Título: "Transações"
Subtítulo: "42 lançamentos em junho · R$ 3.739,70 de resultado"
Ações à direita:
  - Botão "Importar extrato" (ícone Upload, variante outline)
  - Botão "+ Nova transação" (blue-600, ícone Plus)

## Barra de filtros (sticky abaixo do header)

Linha 1 — Filtros principais:
  - Busca: input "Buscar transações..." (ícone Search, max-w-xs)
  - Período: date range picker "01/06/2025 – 30/06/2025"
  - Tipo: segmented control "Todas | Receitas | Despesas"
  - Conta: dropdown multi-select (todas as contas)
  - Categoria: dropdown multi-select (todas as categorias)
  - Botão "Limpar filtros" (ghost, apenas visível se filtro ativo)

## Resumo rápido (3 mini-cards em linha)

  Total de receitas: R$ 12.500,00 (emerald)
  Total de despesas: R$ 8.760,30 (red)
  Resultado:         R$ 3.739,70 (blue se positivo)

## Tabela de transações

Colunas:
  □ | Descrição | Categoria | Conta | Data | Valor | Ações

Ordenação clicável nas colunas: Data (padrão desc) e Valor.

25 transações mockadas, variadas entre receitas e despesas:

  01. Salário Junho          · Salário      · Nubank    · 05/06 · +R$ 8.500,00
  02. Freelance - Cliente A  · Freelance    · Poupança  · 12/06 · +R$ 2.000,00
  03. Aluguel Junho          · Moradia      · Nubank    · 01/06 · -R$ 2.100,00
  04. Supermercado Extra     · Alimentação  · Nubank    · 15/06 · -R$ 234,50
  05. Energia Elétrica       · Moradia      · Nubank    · 10/06 · -R$ 187,40
  06. Posto Shell            · Transporte   · Cartão    · 14/06 · -R$ 180,00
  07. Streaming (Netflix)    · Lazer        · Cartão    · 08/06 · -R$ 55,90
  08. Farmácia Drogasil      · Saúde        · Nubank    · 13/06 · -R$ 67,30
  09. iFood - Jantar         · Alimentação  · Cartão    · 16/06 · -R$ 78,60
  10. Uber                   · Transporte   · Cartão    · 14/06 · -R$ 28,90
  ... (mais 15 linhas similares)

Formatação:
  - Valor positivo: emerald-600 com "+" prefixo, font-mono
  - Valor negativo: red-600 com "-" prefixo, font-mono
  - Categoria: badge colorido com ícone emoji
  - Data: formato "15 jun" (dia + mês abreviado)
  - Checkbox para seleção múltipla
  - Linhas com hover:bg-slate-50

Ações por linha (ícones visíveis no hover):
  · ícone Edit → abre modal de edição
  · ícone Trash2 → confirmação antes de excluir
  · ícone Copy → duplicar transação

Barra de ações em lote (aparece ao selecionar linhas):
  "3 selecionadas" + botões: "Categorizar" | "Excluir" | "Cancelar"

Paginação: "Mostrando 1-25 de 42 transações" + controles prev/next + "25 por página"

## Modal: Nova / Editar Transação

Drawer lateral (400px) deslizando da direita.

Header: "Nova transação" + botão X

Formulário:
  - Tabs: "Receita | Despesa | Transferência"
  - Input "Descrição" (obrigatório, ícone FileText)
  - Input "Valor" (obrigatório, prefixo "R$", tipo number, font-mono)
  - Date picker "Data" (padrão: hoje)
  - Select "Conta" com ícone da instituição
  - Select "Categoria" com ícones coloridos
  - Textarea "Observações" (opcional, max 200 chars)
  - Toggle "Transação recorrente"
    Se ativo, mostrar:
      · Select "Repetir": Diariamente | Semanalmente | Mensalmente | Anualmente
      · Input "Quantidade de repetições" (ou "Sem fim")
  - Toggle "Parcelado" (apenas para Despesa)
    Se ativo, mostrar:
      · Input "Total de parcelas" (2-48)
      · Exibir "Valor por parcela: R$ X"

Footer do drawer:
  - Botão "Cancelar" (outline)
  - Botão "Salvar transação" (blue-600)

## Modal: Importar Extrato

Dialog centralizado (max-w-lg).

Passo 1 — Upload:
  · Área de drag-and-drop:
    Ícone Upload grande
    "Arraste seu extrato aqui"
    "ou clique para selecionar"
    "Formatos aceitos: OFX, CSV, PDF — máx. 10MB"
  · Após upload: mostrar nome do arquivo com ícone check verde
  · Select "Conta de destino"
  · Botão "Continuar"

Passo 2 — Revisão:
  · "Encontramos 18 transações. Revise antes de importar."
  · Mini-tabela com as transações detectadas
  · Coluna extra "Categoria sugerida pela IA" com badge azul "IA"
    (alguns com confiança alta ✓, outros com "?" para revisar)
  · Botão "Confirmar importação" (blue-600)
  · Botão "Voltar"

## Estado vazio (sem transações no período)

  Ícone ArrowLeftRight grande em slate-300
  "Nenhuma transação encontrada"
  "Tente ajustar os filtros ou adicione seu primeiro lançamento."
  Botão "+ Adicionar transação" (blue-600)
```
