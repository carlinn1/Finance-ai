export const monthly = [
  { month: "Jan", receita: 10200, despesa: 8100, resultado: 2100, patrimonio: 10800 },
  { month: "Fev", receita: 9800, despesa: 7600, resultado: 2200, patrimonio: 13000 },
  { month: "Mar", receita: 11500, despesa: 9200, resultado: 2300, patrimonio: 15300 },
  { month: "Abr", receita: 12000, despesa: 8400, resultado: 3600, patrimonio: 17800 },
  { month: "Mai", receita: 11800, despesa: 7900, resultado: 3900, patrimonio: 19840 },
  { month: "Jun", receita: 12500, despesa: 8760, resultado: 3740, patrimonio: 21280 },
];

export const categories = [
  { name: "Alimentacao", label: "Alimentação", value: 1820, color: "#F59E0B" },
  { name: "Moradia", label: "Moradia", value: 2100, color: "#8B5CF6" },
  { name: "Transporte", label: "Transporte", value: 680, color: "#3B82F6" },
  { name: "Saude", label: "Saúde", value: 420, color: "#10B981" },
  { name: "Lazer", label: "Lazer", value: 590, color: "#EC4899" },
  { name: "Outros", label: "Outros", value: 1150, color: "#94A3B8" },
];

export const accounts = [
  { name: "Conta Corrente - Nubank", balance: 8420.5, type: "corrente" },
  { name: "Poupança - Caixa", balance: 15200, type: "poupanca" },
  { name: "Cartão de Crédito Itaú", balance: -2340.8, type: "cartao" },
];

export const transactions = [
  { description: "Salário Junho", category: "Salário", account: "Nubank", date: "05 jun", value: 8500 },
  { description: "Freelance - Cliente A", category: "Freelance", account: "Poupança", date: "12 jun", value: 2000 },
  { description: "Aluguel Junho", category: "Moradia", account: "Nubank", date: "01 jun", value: -2100 },
  { description: "Supermercado Extra", category: "Alimentação", account: "Nubank", date: "15 jun", value: -234.5 },
  { description: "Energia Elétrica", category: "Moradia", account: "Nubank", date: "10 jun", value: -187.4 },
  { description: "Posto Shell", category: "Transporte", account: "Cartão", date: "14 jun", value: -180 },
  { description: "Streaming Netflix", category: "Lazer", account: "Cartão", date: "08 jun", value: -55.9 },
  { description: "Farmácia Drogasil", category: "Saúde", account: "Nubank", date: "13 jun", value: -67.3 },
  { description: "iFood - Jantar", category: "Alimentação", account: "Cartão", date: "16 jun", value: -78.6 },
  { description: "Uber", category: "Transporte", account: "Cartão", date: "14 jun", value: -28.9 },
  { description: "Consultoria - Cliente B", category: "Freelance", account: "Poupança", date: "18 jun", value: 2000 },
  { description: "Plano Celular", category: "Contas Fixas", account: "Cartão", date: "23 jun", value: -89.9 },
  { description: "Academia", category: "Saúde", account: "Nubank", date: "07 jun", value: -119.9 },
  { description: "Padaria Central", category: "Alimentação", account: "Nubank", date: "17 jun", value: -42.8 },
  { description: "Curso Online", category: "Educação", account: "Cartão", date: "11 jun", value: -240 },
  { description: "Seguro Auto", category: "Transporte", account: "Nubank", date: "04 jun", value: -320 },
  { description: "Farmácia Popular", category: "Saúde", account: "Nubank", date: "19 jun", value: -54.9 },
  { description: "Restaurante", category: "Alimentação", account: "Cartão", date: "20 jun", value: -126.4 },
  { description: "Internet Fibra", category: "Contas Fixas", account: "Nubank", date: "06 jun", value: -129.9 },
  { description: "Cinema", category: "Lazer", account: "Cartão", date: "09 jun", value: -84 },
  { description: "Mercado Bairro", category: "Alimentação", account: "Nubank", date: "21 jun", value: -188.7 },
  { description: "Reembolso Saúde", category: "Saúde", account: "Nubank", date: "22 jun", value: 380 },
  { description: "Estacionamento", category: "Transporte", account: "Cartão", date: "18 jun", value: -36 },
  { description: "Software SaaS", category: "Contas Fixas", account: "Cartão", date: "03 jun", value: -79.9 },
  { description: "Presente", category: "Outros", account: "Nubank", date: "02 jun", value: -150 },
];

export const payables = [
  { title: "Aluguel Junho", kind: "pagar", category: "Moradia", account: "Nubank", due: "21/06/2025", days: "3 dias", value: 2100, status: "pendente" },
  { title: "Energia Elétrica", kind: "pagar", category: "Moradia", account: "Nubank", due: "18/06/2025", days: "hoje", value: 187.4, status: "vencido" },
  { title: "Plano Celular", kind: "pagar", category: "Telecom", account: "Cartão", due: "23/06/2025", days: "5 dias", value: 89.9, status: "pendente" },
  { title: "Financiamento Carro", kind: "pagar", category: "Transporte", account: "Nubank", due: "26/06/2025", days: "8 dias", value: 650, status: "pendente" },
  { title: "Netflix", kind: "pagar", category: "Lazer", account: "Cartão", due: "08/06/2025", days: "pago", value: 55.9, status: "pago" },
  { title: "Freelance - Cliente A", kind: "receber", category: "Freelance", account: "Poupança", due: "25/06/2025", days: "7 dias", value: 2000, status: "pendente" },
  { title: "Consultoria - Cliente B", kind: "receber", category: "Freelance", account: "Poupança", due: "05/06/2025", days: "recebido", value: 1500, status: "recebido" },
];

export const budgets = [
  { category: "Alimentação", spent: 1820, limit: 1500 },
  { category: "Moradia", spent: 2287, limit: 2500 },
  { category: "Transporte", spent: 680, limit: 900 },
  { category: "Saúde", spent: 420, limit: 800 },
  { category: "Lazer", spent: 590, limit: 1000 },
  { category: "Educação", spent: 0, limit: 500 },
  { category: "Contas Fixas", spent: 1840, limit: 2000 },
  { category: "Outros", spent: 1123, limit: 1800 },
];

export const goals = [
  { name: "Reserva de Emergência", saved: 13600, target: 20000, deadline: "Dezembro/2025", monthly: 800, forecast: "Fevereiro/2026", status: "No prazo" },
  { name: "Viagem para Europa", saved: 5870, target: 18000, deadline: "Julho/2026", monthly: 400, forecast: "Março/2027", status: "Atenção" },
  { name: "Notebook Novo", saved: 2000, target: 4000, deadline: "Setembro/2025", monthly: 500, forecast: "Setembro/2025", status: "No prazo" },
  { name: "Fundo de Férias", saved: 6000, target: 6000, deadline: "Concluída em 15/05/2025", monthly: 0, forecast: "Concluída", status: "Concluída" },
];

export const forecast = [
  { date: "18/06", otimista: 21600, realista: 21279, pessimista: 20700 },
  { date: "25/06", otimista: 20500, realista: 19800, pessimista: 19200 },
  { date: "02/07", otimista: 24000, realista: 23200, pessimista: 22400 },
  { date: "09/07", otimista: 21000, realista: 20100, pessimista: 19500 },
  { date: "16/07", otimista: 25400, realista: 24500, pessimista: 23600 },
  { date: "23/07", otimista: 22900, realista: 21800, pessimista: 20700 },
  { date: "09/08", otimista: 26300, realista: 25200, pessimista: 24100 },
];
