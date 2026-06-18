import { useState } from "react";
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
import { accounts, categories, monthly, transactions } from "../data/mock";
import { Badge, Button, Card, MetricCard, Money, PageHeader, Skeleton } from "../components/ui";
import { formatMoney } from "../lib/format";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  function refresh() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 800);
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Junho 2025 · Atualizado há 2 min"
        actions={
          <>
            <select className="h-10 rounded-lg border bg-white px-3 text-sm">
              <option>Este mês</option>
              <option>Último mês</option>
              <option>Este ano</option>
            </select>
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
          <MetricCard title="Saldo Total" value={21279.7} icon={Wallet} footer="3 contas ativas" />
          <MetricCard title="Receitas do Mês" value={12500} icon={TrendingUp} tone="positive" variation={{ label: "+8,3% vs mês anterior", variant: "positive" }} footer="7 lançamentos" />
          <MetricCard title="Despesas do Mês" value={8760.3} icon={TrendingDown} tone="negative" variation={{ label: "+12,1% vs mês anterior", variant: "negative" }} footer="34 lançamentos" />
          <MetricCard title="Resultado do Mês" value={3739.7} icon={BarChart3} variation={{ label: "-2,1% vs mês anterior", variant: "negative" }} footer="Economia 29,9%" />
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
                  <Line type="monotone" dataKey="patrimonio" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: "#2563EB" }} />
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
              {["Energia Elétrica", "Aluguel", "Plano Celular", "Financiamento", "Spotify"].map((item, index) => (
                <div key={item} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-slate-900">{item}</p>
                    <p className="text-xs text-slate-500">{["hoje", "3 dias", "5 dias", "8 dias", "12 dias"][index]}</p>
                  </div>
                  <div className="text-right">
                    <Money value={[187.4, 2100, 89.9, 650, 21.9][index]} color={false} />
                    <div className="mt-1">
                      <Badge variant={index === 0 ? "negative" : index === 1 ? "warning" : index === 2 ? "info" : "neutral"}>{index === 0 ? "Vence hoje" : `${[3, 5, 8, 12][index - 1]} dias`}</Badge>
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
              {[
                ["Alimentação acima do limite", "Você gastou R$ 1.820 de R$ 1.500 orçados", "negative"],
                ["Saldo baixo previsto", "Em 8 dias seu saldo pode cair para R$ 4.200", "warning"],
                ["Meta no prazo", "Reserva de emergência: 68% concluída", "positive"],
              ].map(([title, description, variant]) => (
                <button key={title} className="w-full rounded-lg border p-3 text-left hover:bg-slate-50">
                  <Badge variant={variant as "negative" | "warning" | "positive"}>{title}</Badge>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
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
                  <Money value={account.balance} />
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Saldo consolidado</span>
                <Money value={21279.7} color={false} />
              </div>
              <Button className="mt-3 w-full" variant="ghost" icon={Plus}>
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
                {transactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.description} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium">{transaction.description}</td>
                    <td className="px-3 py-3">
                      <Badge variant="neutral">{transaction.category}</Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{transaction.account}</td>
                    <td className="px-3 py-3 text-slate-600">{transaction.date}</td>
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
    </>
  );
}
