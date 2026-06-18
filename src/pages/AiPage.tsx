import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, RotateCcw, Send } from "lucide-react";
import { forecast } from "../data/mock";
import { Badge, Button, Card, Money } from "../components/ui";
import { formatMoney } from "../lib/format";
import { BrandLogo } from "../components/BrandLogo";

export default function AiPage() {
  return (
    <div className="grid min-h-[calc(100vh-3rem)] gap-4 xl:grid-cols-[55fr_45fr]">
      <section className="flex min-h-[720px] flex-col rounded-lg border bg-white">
        <header className="flex items-center justify-between border-b p-5">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <BrandLogo compact className="h-7 w-7" />
              Assistente financeiro
            </h1>
            <p className="text-sm text-slate-500">Pergunte qualquer coisa sobre suas finanças</p>
          </div>
          <Button variant="ghost" icon={RotateCcw}>Nova conversa</Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <ChatBubble by="user">Quanto gastei com alimentação em maio comparado com junho?</ChatBubble>
          <ChatBubble by="ai">
            Boa pergunta. Maio fechou em R$ 1.620,40 e junho já está em R$ 1.820,00. É um aumento de R$ 199,60, com projeção de fechar perto de R$ 2.100 se o ritmo continuar.
          </ChatBubble>
          <ChatBubble by="user">Sim, me dê sugestões</ChatBubble>
          <ChatBubble by="ai">
            Consolide compras de supermercado, reduza delivery de 5 para 2 pedidos por semana e revise cafés e padarias. A economia estimada é de R$ 250 a R$ 320 por mês.
          </ChatBubble>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Digitando...
          </div>
        </div>

        <footer className="border-t p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {["Resumo do mês", "Contas vencendo", "Status das metas", "Maior gasto", "Recomendações"].map((item) => (
              <button key={item} className="rounded-full border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea className="min-h-12 flex-1 resize-none rounded-lg border px-3 py-3 text-sm" placeholder="Pergunte algo sobre suas finanças..." />
            <Button className="h-12 w-12 px-0" icon={Send} aria-label="Enviar" />
          </div>
        </footer>
      </section>

      <aside className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Previsão - próximos 60 dias</h2>
            <Badge variant="info">Atualizado pela IA</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="realista" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <ReferenceLine y={5000} stroke="#D97706" strokeDasharray="4 4" />
                <Area dataKey="otimista" stroke="#10B981" fill="transparent" strokeDasharray="4 4" />
                <Area dataKey="realista" stroke="#2563EB" fill="url(#realista)" strokeWidth={2} />
                <Area dataKey="pessimista" stroke="#F87171" fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <MiniStat label="Saldo em 30 dias" value={24500} />
            <MiniStat label="Menor saldo" value={19200} />
            <MiniStat label="Contas 30d" value={4840} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Alertas Inteligentes</h2>
          <div className="mt-4 space-y-3">
            {[
              ["CRÍTICO", "Orçamento de Alimentação ultrapassado", "negative"],
              ["ATENÇÃO", "Aluguel vence em 3 dias", "warning"],
              ["DICA", "Oportunidade de economia em assinaturas", "positive"],
              ["INFO", "Reserva de emergência no bom caminho", "info"],
            ].map(([label, text, variant]) => (
              <div key={text} className="rounded-lg border p-3">
                <Badge variant={variant as "negative" | "warning" | "positive" | "info"}>{label}</Badge>
                <p className="mt-2 text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Análise Financeira - Junho 2025</h2>
          <p className="mt-1 text-xs text-slate-500">Gerado em 18/06/2025 às 14:32 · pelo assistente financeiro</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p><strong>Situação geral:</strong> saúde financeira positiva, com resultado de R$ 3.739,70 e taxa de poupança de 29,9%.</p>
            <p><strong>Pontos de atenção:</strong> Alimentação ultrapassou o orçamento em 21% e Transporte variou acima da média.</p>
            <p><strong>Recomendação:</strong> manter o orçamento de R$ 1.500 em alimentação e reduzir gastos recorrentes até 30/06.</p>
          </div>
          <Button className="mt-4" variant="outline" icon={Download}>Exportar relatório</Button>
        </Card>
      </aside>
    </div>
  );
}

function ChatBubble({ by, children }: { by: "user" | "ai"; children: string }) {
  return (
    <div className={by === "user" ? "ml-auto max-w-[75%] rounded-lg bg-slate-900 p-4 text-sm text-white" : "max-w-[82%] rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-slate-800"}>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <Money className="mt-1 block font-semibold" value={value} color={false} />
    </div>
  );
}
