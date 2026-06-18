import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileSpreadsheet, TableProperties } from "lucide-react";
import { categories, monthly } from "../data/mock";
import { Badge, Button, Card, Money, PageHeader, inputClass } from "../components/ui";
import { useFeedback } from "../components/feedback";
import { formatMoney, percent } from "../lib/format";

const tabs = ["DRE", "Fluxo por Categoria", "Por Categoria", "Evolução Anual"];
const cashflowByCategory = [
  { category: "Salário", entradas: 8500, saidas: 0, saldo: 8500 },
  { category: "Freelance", entradas: 4000, saidas: 0, saldo: 4000 },
  { category: "Moradia", entradas: 0, saidas: 2287, saldo: -2287 },
  { category: "Alimentação", entradas: 0, saidas: 1820, saldo: -1820 },
  { category: "Transporte", entradas: 0, saidas: 680, saldo: -680 },
  { category: "Outros", entradas: 0, saidas: 3973, saldo: -3973 },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("DRE"); const [period, setPeriod] = useState("Junho 2026"); const [account, setAccount] = useState("Todas as contas"); const { notify } = useFeedback();
  function exportCsv() { const rows = ["Categoria,Entradas,Saidas,Saldo",...cashflowByCategory.map((item) => `${item.category},${item.entradas},${item.saidas},${item.saldo}`)].join("\n"); const url = URL.createObjectURL(new Blob([rows],{type:"text/csv;charset=utf-8"})); const link = document.createElement("a"); link.href=url; link.download="relatorio-financeai.csv"; link.click(); URL.revokeObjectURL(url); notify("Relatório CSV exportado."); }
  return (
    <>
      <PageHeader title="Relatórios" subtitle="Análises e demonstrativos financeiros" actions={<><Button variant="outline" icon={Download} onClick={() => notify("Relatório PDF preparado.")}>PDF</Button><Button variant="outline" icon={FileSpreadsheet} onClick={() => notify("Planilha Excel preparada.")}>Excel</Button><Button variant="outline" icon={TableProperties} onClick={exportCsv}>CSV</Button></>} />
      <Card><div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? "min-w-max rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm" : "min-w-max rounded-md px-3 py-2 text-sm text-slate-600"}>{item}</button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-xl"><select className={inputClass} value={period} onChange={(event) => setPeriod(event.target.value)}><option>Junho 2026</option><option>Últimos 3 meses</option><option>Este ano</option></select><select className={inputClass} value={account} onChange={(event) => setAccount(event.target.value)}><option>Todas as contas</option><option>Nubank</option><option>Poupança</option><option>Cartão</option></select></div></Card>
      <div className="mt-4">{tab === "DRE" && <DreReport />}{tab === "Fluxo por Categoria" && <CashflowReport />}{tab === "Por Categoria" && <CategoryReport />}{tab === "Evolução Anual" && <AnnualReport />}</div>
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Relatório filtrado por <strong>{period}</strong> em <strong>{account}</strong>. A IA pode detalhar qualquer variação apresentada.</div>
    </>
  );
}

function DreReport() { return <Card><p className="mb-3 text-sm text-slate-500">Competência e caixa: Junho 2026</p><div className="overflow-hidden rounded-lg border"><DreRow label="RECEITAS" value={12500} heading /><DreRow label="Salário" value={8500} inset /><DreRow label="Freelance / Consultoria" value={4000} inset /><DreRow label="DESPESAS OPERACIONAIS" value={-8760.3} heading />{categories.map((item) => <DreRow key={item.name} label={item.label} value={-item.value} inset />)}<DreRow label="RESULTADO DO PERÍODO" value={3739.7} result /></div></Card>; }

function CashflowReport() { return <><Card><div><h2 className="font-semibold">Fluxo de caixa por categoria</h2><p className="mt-1 text-sm text-slate-500">Entradas, saídas e saldo líquido por grupo financeiro.</p></div><div className="mt-5 h-80"><ResponsiveContainer><BarChart data={cashflowByCategory}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="category" /><YAxis tickFormatter={(value) => `${Number(value)/1000}k`} /><Tooltip formatter={(value) => formatMoney(Number(value))} /><Bar dataKey="entradas" fill="#059669" radius={[5,5,0,0]} /><Bar dataKey="saidas" fill="#F87171" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div></Card><Card className="mt-4"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Categoria</th><th className="p-3 text-right">Entradas</th><th className="p-3 text-right">Saídas</th><th className="p-3 text-right">Saldo</th></tr></thead><tbody>{cashflowByCategory.map((item) => <tr key={item.category} className="border-t"><td className="p-3 font-medium">{item.category}</td><td className="p-3 text-right"><Money value={item.entradas} /></td><td className="p-3 text-right"><Money value={-item.saidas} /></td><td className="p-3 text-right"><Money value={item.saldo} /></td></tr>)}</tbody></table></div></Card></>; }

function CategoryReport() { return <Card><h2 className="font-semibold">Análise por categoria</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Categoria</th><th className="p-3 text-right">Transações</th><th className="p-3 text-right">Total gasto</th><th className="p-3 text-right">% do total</th><th className="p-3">Tendência</th></tr></thead><tbody>{categories.map((item,index) => <tr key={item.name} className="border-t"><td className="p-3 font-medium">{item.label}</td><td className="p-3 text-right">{[9,3,6,4,5,8][index]}</td><td className="p-3 text-right"><Money value={item.value} color={false} /></td><td className="p-3 text-right">{percent((item.value/8760.3)*100)}</td><td className="p-3"><Badge variant={index%2 ? "positive" : "warning"}>{index%2 ? "melhorando" : "atenção"}</Badge></td></tr>)}</tbody></table></div></Card>; }

function AnnualReport() { return <Card><h2 className="font-semibold">Evolução anual</h2><p className="mt-1 text-sm text-slate-500">Receitas, despesas, resultado e patrimônio acumulado.</p><div className="mt-5 h-96"><ResponsiveContainer><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `${Number(value)/1000}k`} /><Tooltip formatter={(value) => formatMoney(Number(value))} /><Line dataKey="receita" stroke="#059669" strokeWidth={2} /><Line dataKey="despesa" stroke="#DC2626" strokeWidth={2} /><Line dataKey="resultado" stroke="#D97706" strokeWidth={2} /><Line dataKey="patrimonio" stroke="#2563EB" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Card>; }
function DreRow({ label,value,heading=false,inset=false,result=false }: { label:string;value:number;heading?:boolean;inset?:boolean;result?:boolean }) { return <div className={heading ? "flex justify-between bg-slate-100 px-4 py-3 text-sm font-semibold" : result ? "flex justify-between bg-emerald-50 px-4 py-4 font-semibold text-emerald-700" : "flex justify-between px-4 py-3 text-sm odd:bg-white even:bg-slate-50"}><span className={inset ? "pl-5" : ""}>{label}</span><Money value={value} color={result || value < 0} /></div>; }
