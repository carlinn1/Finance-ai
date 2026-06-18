# Implementações Pendentes no Frontend

Analise todo o frontend atual e implemente as telas, botões, fluxos e ajustes que ainda estão faltando. Mantenha o design moderno, responsivo, profissional e coerente com o sistema financeiro.

## Ajustes Globais

* Adicionar botão de **Deslogar / Sair da Conta**
* O botão deve aparecer no menu lateral, no perfil do usuário ou no canto superior direito
* Ao clicar, limpar sessão/token e redirecionar para a tela de login
* Garantir responsividade em desktop, tablet e mobile

---

## Página Inicial / Landing Page

Na aba principal do site, adicionar uma seção de **Planos e Licença**.

Criar cards modernos com:

### Plano Trial

* Teste gratuito
* Acesso completo por tempo limitado
* Botão: Começar Teste Grátis

### Licença Única

* Pagamento único
* Acesso vitalício
* Sem mensalidade
* Botão: Comprar Licença

Adicionar visual moderno com cards, destaque de preço, benefícios e botão CTA.

---

## Configurações

Criar ou completar as seguintes áreas:

### Licença

Adicionar seção para:

* Ver status da licença
* Ver data de ativação
* Ver tipo de licença
* Ver comprovante de compra
* Botão: Ver Comprovante
* Botão: Comprar / Ativar Licença, caso não esteja ativa

### Segurança

Adicionar configuração de **2FA**.

Funcionalidades:

* Ativar autenticação de dois fatores
* Exibir QR Code
* Campo para confirmar código
* Botão para ativar 2FA
* Botão para desativar 2FA
* Exibir status: Ativado / Desativado

---

## Relatórios

Adicionar relatórios que estão faltando:

### Fluxo de Caixa por Categoria

Criar tela/gráfico mostrando:

* Entradas por categoria
* Saídas por categoria
* Saldo por categoria
* Filtros por período
* Filtro por conta

### Evolução Anual

Criar relatório com gráfico anual mostrando:

* Receitas por mês
* Despesas por mês
* Resultado mensal
* Evolução do saldo no ano

Adicionar botões de exportação:

* PDF
* Excel
* CSV

---

## Metas Financeiras

Na tela de Metas Financeiras, adicionar botão:

* Nova Meta

Ao clicar, abrir modal ou página com formulário:

Campos:

* Nome da meta
* Valor alvo
* Valor atual
* Prazo
* Conta vinculada
* Descrição
* Botão Salvar
* Botão Cancelar

Também melhorar os cards das metas mostrando:

* Progresso percentual
* Valor acumulado
* Valor restante
* Prazo
* Status da meta

---

## Orçamento

Na tela de Orçamento, adicionar botão:

* Novo Orçamento

Formulário com:

* Categoria
* Valor limite
* Mês
* Ano
* Recorrente: sim/não
* Botão Salvar
* Botão Cancelar

Exibir cards ou tabela com:

* Categoria
* Valor gasto
* Limite definido
* Percentual usado
* Barra de progresso
* Status visual:

  * Verde abaixo de 75%
  * Amarelo entre 75% e 99%
  * Vermelho acima de 100%

---

## Contas a Pagar e Receber

Completar a tela com abas:

* Todas
* A Pagar
* A Receber
* Vencidas
* Pagas

Adicionar botões:

* Nova Conta a Pagar
* Nova Conta a Receber

Formulário para nova conta:

* Tipo: pagar ou receber
* Descrição
* Valor
* Data de vencimento
* Categoria
* Conta associada
* Contato
* Recorrente: sim/não
* Observações
* Botão Salvar
* Botão Cancelar

Na listagem, exibir:

* Descrição
* Tipo
* Valor
* Vencimento
* Status
* Categoria
* Ações: editar, excluir, marcar como pago/recebido

---

## Transações

Completar a tela de transações com botão:

* Nova Transação

Adicionar opções:

* Receita
* Despesa
* Transferência

Formulário para nova transação:

* Tipo: receita, despesa ou transferência
* Valor
* Data
* Conta
* Categoria
* Descrição
* Recorrente: sim/não
* Parcelado: sim/não
* Quantidade de parcelas, se for parcelado
* Botão Salvar
* Botão Cancelar

Na listagem, adicionar filtros:

* Período
* Tipo
* Conta
* Categoria
* Valor mínimo
* Valor máximo

Adicionar ações:

* Editar
* Excluir
* Duplicar

---

## Experiência de Usuário

Implementar:

* Modais modernos
* Toasts de sucesso e erro
* Skeleton loading
* Estados vazios
* Confirmação antes de excluir
* Feedback visual após salvar
* Validação dos formulários
* Máscara de moeda em reais
* Máscara de data
* Layout responsivo

---

## Resultado Esperado

O frontend deve ficar completo, funcional e profissional, com todas as telas principais implementadas:

* Logout funcionando
* Planos na página inicial
* Licença e comprovante em configurações
* 2FA em configurações
* Relatórios completos
* Nova meta
* Novo orçamento
* Contas a pagar e receber completas
* Nova transação com receita, despesa e transferência

Não remover funcionalidades existentes. Apenas completar, melhorar e integrar tudo com design moderno e responsivo.
