# 📋 Requisitos Funcionais — App Financeiro com IA

> **Versão:** 1.0  
> **Stack:** Golang (backend) · PostgreSQL (banco) · Lovable (frontend) · Claude AI  
> **Modelo de negócio:** Licença única (one-time payment)  
> **Acesso:** Web (browser)

---

## Visão Geral do Sistema

Aplicação financeira multi-propósito destinada a pessoas físicas, MEIs, autônomos e pequenas/médias empresas. O sistema permite controle completo de receitas, despesas, contas a pagar/receber e metas financeiras, com inteligência artificial integrada para categorização automática, análise conversacional, previsão de fluxo de caixa e alertas inteligentes.

---

## RF01 — Autenticação e Gestão de Usuários

### RF01.1 — Cadastro de Conta
- O sistema deve permitir que novos usuários se cadastrem informando nome completo, e-mail e senha.
- O e-mail deve ser único no sistema e validado via link de confirmação enviado ao usuário.
- A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, número e caractere especial.

### RF01.2 — Login com E-mail e Senha
- O sistema deve autenticar usuários via e-mail e senha.
- Em caso de senha incorreta, o sistema deve exibir mensagem genérica (sem revelar qual campo está errado) e bloquear a conta temporariamente após 5 tentativas falhas consecutivas.

### RF01.3 — Login Social
- O sistema deve permitir autenticação via conta Google (OAuth 2.0).
- O sistema deve permitir autenticação via conta GitHub (OAuth 2.0).
- Ao realizar login social pela primeira vez, uma conta é criada automaticamente vinculada ao provedor.

### RF01.4 — Autenticação de Dois Fatores (2FA)
- O sistema deve oferecer a opção de habilitar 2FA via aplicativo autenticador (TOTP — ex.: Google Authenticator, Authy).
- Ao habilitar, o sistema deve exibir QR Code e código de backup para recuperação.
- O 2FA deve ser solicitado a cada novo login em dispositivo não reconhecido.

### RF01.5 — Recuperação de Senha
- O sistema deve permitir que o usuário solicite redefinição de senha via e-mail.
- O link de redefinição deve expirar em 1 hora e ser de uso único.

### RF01.6 — Perfil do Usuário
- O usuário deve poder atualizar nome, foto de perfil, e-mail (com revalidação) e senha.
- O usuário deve poder definir o tipo de perfil: **Pessoa Física**, **MEI/Autônomo** ou **Empresa (PME)**.
- O perfil deve armazenar moeda padrão (ex.: BRL) e fuso horário.

---

## RF02 — Gestão de Contas Financeiras

### RF02.1 — Cadastro de Contas
- O usuário deve poder cadastrar múltiplas contas financeiras (conta corrente, poupança, carteira, cartão de crédito, etc.).
- Cada conta deve ter: nome, tipo, instituição financeira, moeda e saldo inicial.
- O usuário deve poder marcar uma conta como **ativa** ou **arquivada**.

### RF02.2 — Saldo e Extrato por Conta
- O sistema deve calcular e exibir o saldo atual de cada conta com base nas transações registradas.
- O usuário deve poder visualizar o extrato de movimentações de cada conta com filtros por período.

### RF02.3 — Conciliação de Saldo
- O usuário deve poder registrar um saldo de conciliação manual para ajustar divergências com o extrato bancário real.

---

## RF03 — Registro e Importação de Transações

### RF03.1 — Lançamento Manual
- O usuário deve poder registrar receitas e despesas informando: valor, data, categoria, conta, descrição e se é recorrente.
- O sistema deve suportar transações de transferência entre contas cadastradas.
- O sistema deve suportar parcelamento de despesas (ex.: 12x), criando automaticamente os lançamentos futuros.

### RF03.2 — Transações Recorrentes
- O usuário deve poder definir transações recorrentes (diária, semanal, mensal, anual).
- O sistema deve gerar automaticamente os lançamentos futuros com base na recorrência configurada.
- O usuário deve poder pausar, editar ou cancelar uma recorrência a qualquer momento.

### RF03.3 — Importação de Extratos
- O sistema deve aceitar importação de extratos nos formatos **OFX**, **CSV** e **PDF**.
- Durante a importação, o sistema deve detectar e ignorar transações duplicadas.
- O usuário deve revisar e confirmar as transações antes de salvar.
- A IA deve sugerir categorias para cada transação importada (ver RF05.1).

### RF03.4 — Integração com Open Finance (Open Banking Brasil)
- O sistema deve permitir conexão com instituições financeiras via **API Open Finance Brasil**.
- O usuário deve autorizar e revogar o acesso a cada instituição financeira conectada.
- As transações devem ser sincronizadas automaticamente em intervalos configuráveis (ex.: a cada 6h).
- O sistema deve exibir o status da conexão de cada instituição (ativa, expirada, com erro).

### RF03.5 — Gestão de Transações
- O usuário deve poder editar, excluir e duplicar qualquer transação.
- O sistema deve manter histórico de alterações (audit log) das transações.
- O usuário deve poder filtrar transações por: período, categoria, conta, tipo (receita/despesa) e valor.

---

## RF04 — Categorias e Subcategorias

### RF04.1 — Categorias Padrão
- O sistema deve oferecer um conjunto de categorias e subcategorias padrão para receitas e despesas (ex.: Alimentação, Transporte, Saúde, Salário, etc.).

### RF04.2 — Categorias Personalizadas
- O usuário deve poder criar, editar e excluir categorias e subcategorias personalizadas.
- Cada categoria deve ter nome, tipo (receita/despesa/ambos), ícone e cor.

### RF04.3 — Regras de Categorização
- O usuário deve poder criar regras automáticas de categorização baseadas em palavras-chave da descrição da transação.
- As regras devem ser aplicadas automaticamente nas importações futuras.

---

## RF05 — Inteligência Artificial (IA)

### RF05.1 — Categorização Automática por IA
- A IA deve analisar a descrição de cada transação importada ou lançada e sugerir automaticamente a categoria mais adequada.
- O usuário deve poder confirmar ou corrigir a sugestão; o sistema deve aprender com as correções ao longo do tempo.
- A IA deve apresentar o grau de confiança da categorização sugerida.

### RF05.2 — Chat Financeiro (Assistente IA)
- O sistema deve oferecer um chat integrado onde o usuário possa fazer perguntas em linguagem natural sobre suas finanças.
- Exemplos de consultas suportadas:
  - *"Quanto gastei com alimentação em maio?"*
  - *"Qual é minha média de gastos mensais?"*
  - *"Estou indo bem com meu orçamento?"*
  - *"Quando posso quitar minha dívida X?"*
- O assistente deve ter acesso ao contexto completo de dados financeiros do usuário autenticado.
- O histórico de conversas deve ser salvo e acessível pelo usuário.

### RF05.3 — Previsão de Fluxo de Caixa
- A IA deve gerar previsões de fluxo de caixa para os próximos 30, 60 e 90 dias com base em:
  - Histórico de transações passadas.
  - Contas a pagar e receber cadastradas.
  - Transações recorrentes configuradas.
- O sistema deve exibir a previsão em gráfico de linha com faixas de confiança (otimista, realista, pessimista).
- O usuário deve poder simular cenários alterando variáveis manualmente.

### RF05.4 — Alertas e Recomendações Inteligentes
- A IA deve gerar alertas proativos para situações como:
  - Gasto acima da média em determinada categoria.
  - Saldo baixo previsto para os próximos dias.
  - Conta a vencer em breve sem saldo suficiente.
  - Meta financeira em risco de não ser atingida.
- O sistema deve enviar notificações via e-mail e alertas in-app.
- O usuário deve poder configurar quais alertas deseja receber e por qual canal.
- A IA deve gerar recomendações personalizadas de economia com base nos padrões de gastos detectados.

---

## RF06 — Dashboard

### RF06.1 — Visão Geral Financeira
- O dashboard deve exibir, na tela inicial, um resumo com:
  - Saldo total consolidado de todas as contas.
  - Total de receitas e despesas do mês corrente.
  - Resultado do mês (receitas − despesas).
  - Próximos vencimentos (contas a pagar/receber nos próximos 7 dias).
  - Alertas ativos da IA.

### RF06.2 — Gráficos e Visualizações
- O dashboard deve incluir:
  - Gráfico de pizza/donut: distribuição de gastos por categoria.
  - Gráfico de barras: evolução mensal de receitas vs. despesas (últimos 12 meses).
  - Gráfico de linha: saldo ao longo do tempo.
  - Indicador de progresso de cada meta financeira ativa.
- O usuário deve poder filtrar os gráficos por período e por conta.

### RF06.3 — Personalização do Dashboard
- O usuário deve poder reorganizar os widgets do dashboard via drag-and-drop.
- O usuário deve poder ocultar ou adicionar widgets conforme sua preferência.

---

## RF07 — Contas a Pagar e Receber

### RF07.1 — Cadastro
- O usuário deve poder cadastrar contas a pagar e a receber informando: descrição, valor, vencimento, categoria, conta associada e se é recorrente.
- Deve ser possível vincular um contato (pessoa/empresa) a cada conta.

### RF07.2 — Baixa (Liquidação)
- O usuário deve poder registrar o pagamento ou recebimento de uma conta, com valor real e data de liquidação.
- O sistema deve lançar a transação correspondente na conta financeira vinculada.
- Deve ser possível liquidar parcialmente uma conta (ex.: pagamento parcial).

### RF07.3 — Listagem e Filtros
- O usuário deve poder listar contas a pagar/receber filtrando por: status (pendente, pago, vencido), período, categoria e contato.
- O sistema deve destacar visualmente as contas vencidas e as que vencem nos próximos 3 dias.

### RF07.4 — Alertas de Vencimento
- O sistema deve notificar o usuário sobre contas a vencer com antecedência configurável (ex.: 1, 3 ou 7 dias antes).

---

## RF08 — Orçamento por Categoria

### RF08.1 — Definição de Orçamentos
- O usuário deve poder definir um valor limite de gasto mensal para cada categoria ou subcategoria.
- O orçamento deve ser configurável por mês específico ou como padrão recorrente.

### RF08.2 — Acompanhamento em Tempo Real
- O sistema deve exibir, para cada categoria com orçamento, o valor gasto vs. limite definido, em barra de progresso.
- As barras devem mudar de cor conforme o percentual atingido: verde (< 75%), amarelo (75–99%), vermelho (≥ 100%).

### RF08.3 — Alertas de Orçamento
- O sistema deve alertar o usuário quando atingir 80% e 100% do orçamento de uma categoria.
- A IA deve sugerir ações para cortar gastos quando um orçamento for ultrapassado.

---

## RF09 — Relatórios

### RF09.1 — Demonstrativo de Resultado (DRE)
- O sistema deve gerar um DRE simplificado com: receitas, despesas por categoria, resultado bruto e resultado líquido.
- O relatório deve ser filtrável por período (mês, trimestre, ano ou intervalo personalizado).

### RF09.2 — Fluxo de Caixa
- O sistema deve gerar relatório de fluxo de caixa (realizado e projetado) por período selecionado.
- Deve exibir entradas, saídas e saldo período a período (diário, semanal ou mensal).

### RF09.3 — Relatório por Categoria
- O sistema deve gerar análise detalhada de gastos por categoria com comparativo entre períodos.

### RF09.4 — Exportação
- Todos os relatórios devem ser exportáveis nos formatos **PDF** e **Excel (XLSX)**.
- As transações filtradas devem poder ser exportadas em **CSV**.

---

## RF10 — Metas Financeiras

### RF10.1 — Cadastro de Metas
- O usuário deve poder criar metas financeiras informando: nome, valor-alvo, prazo, conta de destino e descrição.
- Exemplos: *"Reserva de emergência de R$ 10.000 até dezembro"*, *"Viagem para Europa em 18 meses"*.

### RF10.2 — Acompanhamento de Progresso
- O sistema deve calcular e exibir o progresso de cada meta com base no saldo da conta vinculada ou nos aportes registrados.
- Deve exibir: valor acumulado, valor restante, percentual concluído e prazo estimado para conclusão.

### RF10.3 — Aportes e Contribuições
- O usuário deve poder registrar aportes manuais à meta.
- O sistema deve permitir configurar aporte automático mensal e integrá-lo como transação recorrente.

### RF10.4 — IA para Metas
- A IA deve analisar o perfil financeiro do usuário e sugerir valor de aporte mensal ideal para atingir cada meta no prazo.
- A IA deve alertar quando o ritmo de aportes atual colocar a meta em risco de não ser cumprida no prazo.

---

## RF11 — Contatos (Pessoas e Empresas)

### RF11.1 — Cadastro de Contatos
- O usuário deve poder cadastrar contatos (clientes, fornecedores, pessoas) com: nome, CPF/CNPJ, e-mail, telefone e observações.

### RF11.2 — Histórico por Contato
- O sistema deve exibir o histórico de transações e contas a pagar/receber associadas a cada contato.

---

## RF12 — Licença e Acesso

### RF12.1 — Compra de Licença
- O sistema deve integrar com gateway de pagamento para processar a compra da licença única.
- Após confirmação do pagamento, o acesso completo ao sistema deve ser liberado automaticamente.
- O usuário deve receber comprovante de compra por e-mail.

### RF12.2 — Período de Trial
- O sistema deve oferecer período gratuito de avaliação (ex.: 14 dias) com acesso a todas as funcionalidades.
- Ao expirar o trial, o acesso deve ser bloqueado até a aquisição da licença.

### RF12.3 — Transferência de Licença
- A licença deve ser vinculada ao e-mail do usuário e não transferível para terceiros.

---

## Resumo dos Módulos — MVP

| # | Módulo | Prioridade |
|---|--------|-----------|
| RF01 | Autenticação e Usuários | 🔴 Alta |
| RF02 | Gestão de Contas Financeiras | 🔴 Alta |
| RF03 | Registro e Importação de Transações | 🔴 Alta |
| RF04 | Categorias | 🔴 Alta |
| RF05 | Inteligência Artificial | 🔴 Alta |
| RF06 | Dashboard | 🔴 Alta |
| RF07 | Contas a Pagar e Receber | 🔴 Alta |
| RF08 | Orçamento por Categoria | 🟡 Média |
| RF09 | Relatórios | 🟡 Média |
| RF10 | Metas Financeiras | 🟡 Média |
| RF11 | Contatos | 🟢 Baixa |
| RF12 | Licença e Acesso | 🔴 Alta |

---

*Documento gerado em 18/06/2026 — sujeito a revisão e refinamento iterativo.*
