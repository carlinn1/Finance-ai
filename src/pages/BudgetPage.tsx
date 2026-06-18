import { useState, type FormEvent } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { budgets } from "../data/mock";
import { Badge, Button, Card, CurrencyInput, Field, Money, PageHeader, ProgressBar, inputClass } from "../components/ui";
import { ConfirmDialog, Modal, useFeedback } from "../components/feedback";
import { percent } from "../lib/format";

function budgetTone(used: number) { if (used >= 100) return { bar: "bg-red-500", badge: "Ultrapassado", variant: "negative" as const }; if (used >= 75) return { bar: "bg-amber-500", badge: "Atenção", variant: "warning" as const }; return { bar: "bg-emerald-500", badge: "Saudável", variant: "positive" as const }; }

export default function BudgetPage() {
  const [items, setItems] = useState(budgets);
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { notify } = useFeedback();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const category = String(data.get("category"));
    if (!category || limit <= 0) return notify("Informe categoria e valor limite.", "error");
    setItems((current) => [...current.filter((item) => item.category !== category), { category, spent: 0, limit }]); setOpen(false); setLimit(0); notify("Orçamento salvo.");
  }

  return (
    <>
      <PageHeader title="Orçamento" subtitle="Junho 2025 · R$ 8.760 gastos de R$ 11.500 orçados (76,2%)" actions={<><Button variant="outline">Junho 2025</Button><Button icon={Plus} onClick={() => setOpen(true)}>Novo orçamento</Button></>} />
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>Alimentação ultrapassou o orçamento em R$ 320,00.</strong> A IA identificou delivery como principal desvio.</div>
      <Card><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-slate-500">Gasto total</p><p className="mt-1 text-2xl font-semibold"><Money value={8760} color={false} /> <span className="text-sm font-normal text-slate-500">de R$ 11.500</span></p></div><p className="text-sm text-slate-500">Restam R$ 2.740 até 30/06 · 12 dias restantes</p></div><div className="mt-4"><ProgressBar value={76.2} color="bg-amber-500" /></div></Card>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((budget) => { const used = budget.limit ? (budget.spent / budget.limit) * 100 : 0; const tone = budgetTone(used); return (
          <Card key={budget.category} className="group surface-hover"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{budget.category}</h2><p className="money mt-2 text-lg font-semibold"><Money value={budget.spent} color={false} /> <span className="text-sm font-normal text-slate-500">/ R$ {budget.limit.toLocaleString("pt-BR")}</span></p></div><Badge variant={tone.variant}>{tone.badge}</Badge></div><div className="mt-4"><ProgressBar value={used} color={tone.bar} /></div><div className="mt-3 flex justify-between text-sm text-slate-500"><span>{percent(used)}</span><span>R$ {Math.abs(budget.limit - budget.spent).toLocaleString("pt-BR")} {budget.spent > budget.limit ? "acima" : "restantes"}</span></div><div className="mt-4 flex gap-2"><Button variant="outline" icon={Edit} onClick={() => setOpen(true)}>Editar</Button><Button variant="ghost" icon={Trash2} onClick={() => setDeleting(budget.category)}>Excluir</Button></div></Card>
        ); })}
      </section>
      <Modal open={open} title="Definir orçamento" onClose={() => setOpen(false)} footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" form="budget-form">Salvar orçamento</Button></>}>
        <form id="budget-form" className="grid gap-4" onSubmit={save}><Field label="Categoria"><select name="category" className={inputClass} required><option value="">Selecione</option>{["Alimentação", "Moradia", "Transporte", "Saúde", "Lazer", "Educação", "Outros"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Valor limite"><CurrencyInput onValueChange={setLimit} required /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Mês"><select name="month" className={inputClass}><option>Junho</option><option>Julho</option></select></Field><Field label="Ano"><input name="year" className={inputClass} type="number" defaultValue={2026} /></Field></div><label className="flex items-center justify-between rounded-lg border p-3 text-sm">Repetir todos os meses<input name="recurring" type="checkbox" className="h-4 w-4" /></label></form>
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Excluir orçamento?" description={`O orçamento de ${deleting ?? "esta categoria"} será removido.`} onClose={() => setDeleting(null)} onConfirm={() => { setItems((current) => current.filter((item) => item.category !== deleting)); setDeleting(null); notify("Orçamento excluído."); }} />
    </>
  );
}
