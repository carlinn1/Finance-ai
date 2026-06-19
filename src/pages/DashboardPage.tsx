import { useEffect, useState } from "react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Plus, RefreshCw, Sparkles, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Badge, Button, Card, CurrencyInput, Field, MetricCard, Money, PageHeader, Skeleton, inputClass } from "../components/ui";
import { formatMoney } from "../lib/format";
import { api, toDateLabel, type Account, type Bill, type Transaction } from "../lib/api";
import { Modal, useFeedback } from "../components/feedback";

type DashboardData = {
  period: string;
  summary: { balance: number; income: number; expense: number; result: number; account_count: number; income_count: number; expense_count: number };
  monthly: Array<{ month: string; receita: number; despesa: number; resultado: number }>;
  categories: Array<{ id: string; name: string; label: string; value: number; color: string }>;
  accounts: Account[];
  recent_transactions: Transaction[];
  upcoming_bills: Bill[];
  alerts: Array<{ type: string; level: string; title: string; message: string }>;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const { notify } = useFeedback();

  async function refresh() {
    setLoading(true);
    try { setData(await api<DashboardData>("/dashboard/summary")); }
    catch (error) { notify(error instanceof Error ? error.message : "Falha ao carregar o dashboard.", "error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  const summary = data?.summary ?? { balance: 0, income: 0, expense: 0, result: 0, account_count: 0, income_count: 0, expense_count: 0 };
  const monthly = data?.monthly ?? [];
  const categories = data?.categories ?? [];
  const accounts = data?.accounts ?? [];
  const transactions = data?.recent_transactions ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} · dados persistidos`}
        actions={
          <>
            <span className="inline-flex h-10 items-center rounded-lg border bg-white px-3 text-sm text-slate-600">Mês atual</span>
            <Button variant="ghost" icon={RefreshCw} onClick={refresh}>
              Atualizar
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-6" aria-label="Atualizando dashboard">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}
          </div>
          <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
            <Skeleton className="h-[380px]" />
            <Skeleton className="h-[380px]" />
          </div>
        </div>
      ) : <div className="transition">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Saldo Total" value={summary.balance} icon={Wallet} footer={`${summary.account_count} contas ativas`} />
          <MetricCard title="Receitas do Mês" value={summary.income} icon={TrendingUp} tone="positive" footer={`${summary.income_count} lançamentos`} />
          <MetricCard title="Despesas do Mês" value={summary.expense} icon={TrendingDown} tone="negative" footer={`${summary.expense_count} lançamentos`} />
          <MetricCard title="Resultado do Mês" value={summary.result} icon={BarChart3} footer={summary.income ? `Economia ${((summary.result / summary.income) * 100).toFixed(1)}%` : "Sem receitas no período"} />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[3fr_2fr]">
          <Card>
            <h2 className="text-base font-semibold">Evolução Mensal</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer>
                <ComposedChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Bar dataKey="receita" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesa" fill="#F87171" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="resultado" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: "#2563EB" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Gastos por Categoria</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="label" innerRadius={70} outerRadius={100} paddingAngle={2}>
                      {categories.map((category) => (
                        <Cell key={category.name} fill={category.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 text-sm">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />
                      {category.label}
                    </span>
                    <Money value={category.value} color={false} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1.5fr_1.5fr]">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Próximos Vencimentos</h2>
              <a href="/contas-pagar-receber" className="text-sm font-medium text-primary">
                Ver todos
              </a>
            </div>
            <div className="mt-4 space-y-3">
              {(data?.upcoming_bills ?? []).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.description}</p>
                    <p className="text-xs text-slate-500">{toDateLabel(item.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <Money value={item.amount - item.paid_amount} color={false} />
                    <div className="mt-1">
                      <Badge variant={item.status === "overdue" ? "negative" : "warning"}>{item.status === "overdue" ? "Vencida" : "Pendente"}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Alertas Inteligentes
            </h2>
            <div className="mt-4 space-y-3">
              {(data?.alerts ?? []).map((alert) => (
                <button key={`${alert.type}-${alert.message}`} className="w-full rounded-lg border p-3 text-left hover:bg-slate-50">
                  <Badge variant={alert.level === "critical" ? "negative" : "warning"}>{alert.title}</Badge>
                  <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" variant="ghost">
              Ver recomendações completas
            </Button>
          </Card>

          <Card>
            <h2 className="font-semibold">Minhas Contas</h2>
            <div className="mt-4 space-y-3">
              {accounts.map((account) => (
                <div key={account.name} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">{account.name}</span>
                  <Money value={account.current_balance} />
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Saldo consolidado</span>
                <Money value={summary.balance} color={false} />
              </div>
              <Button className="mt-3 w-full" variant="ghost" icon={Plus} onClick={() => setAccountOpen(true)}>
                Adicionar conta
              </Button>
            </div>
          </Card>
        </section>

        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Últimas Transações</h2>
            <a href="/transacoes" className="text-sm font-medium text-primary">
              Ver todas
            </a>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Descrição</th>
                  <th className="px-3 py-3">Categoria</th>
                  <th className="px-3 py-3">Conta</th>
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium">{transaction.description}</td>
                    <td className="px-3 py-3">
                      <Badge variant="neutral">{transaction.category}</Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{transaction.account}</td>
                    <td className="px-3 py-3 text-slate-600">{toDateLabel(transaction.date)}</td>
                    <td className="px-3 py-3 text-right">
                      <Money value={transaction.value} signed />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>}
      <Modal open={accountOpen} title="Adicionar conta financeira" onClose={() => setAccountOpen(false)} footer={<><Button variant="outline" onClick={() => setAccountOpen(false)}>Cancelar</Button><Button type="submit" form="account-form">Salvar conta</Button></>}>
        <form id="account-form" className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api("/accounts", { method: "POST", body: JSON.stringify({ name: form.get("name"), type: form.get("type"), institution: form.get("institution"), currency: "BRL", initial_balance: initialBalance }) }); setAccountOpen(false); await refresh(); notify("Conta adicionada com sucesso."); } catch (error) { notify(error instanceof Error ? error.message : "Falha ao criar conta.", "error"); } }}>
          <Field label="Nome"><input name="name" className={inputClass} placeholder="Ex.: Conta corrente" required /></Field>
          <Field label="Tipo"><select name="type" className={inputClass}><option value="checking">Conta corrente</option><option value="savings">Poupança</option><option value="wallet">Carteira</option><option value="credit_card">Cartão de crédito</option><option value="investment">Investimento</option></select></Field>
          <Field label="Instituição"><input name="institution" className={inputClass} placeholder="Banco ou instituição" /></Field>
          <Field label="Saldo inicial"><CurrencyInput onValueChange={setInitialBalance} /></Field>
        </form>
      </Modal>
    </>
  );
}
