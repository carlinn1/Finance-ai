import { useMemo, useState, type FormEvent } from "react";
import { CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import { payables } from "../data/mock";
import { Badge, Button, Card, CurrencyInput, EmptyState, Field, Money, PageHeader, inputClass } from "../components/ui";
import { ConfirmDialog, Modal, useFeedback } from "../components/feedback";
import { cn } from "../lib/format";

const tabs = ["Todas", "A Pagar", "A Receber", "Vencidas", "Pagas"];

export default function PayablesPage() {
  const [items, setItems] = useState(payables);
  const [tab, setTab] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [kind, setKind] = useState<"pagar" | "receber">("pagar");
  const [amount, setAmount] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { notify } = useFeedback();
  const filtered = useMemo(() => items.filter((item) => tab === "Todas" || (tab === "A Pagar" && item.kind === "pagar") || (tab === "A Receber" && item.kind === "receber") || (tab === "Vencidas" && item.status === "vencido") || (tab === "Pagas" && ["pago", "recebido"].includes(item.status))), [items, tab]);

  function openForm(nextKind: "pagar" | "receber") { setKind(nextKind); setModalOpen(true); }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const title = String(data.get("description")); const due = String(data.get("due"));
    if (!title || !due || amount <= 0) return notify("Preencha descrição, valor e vencimento.", "error");
    setItems((current) => [{ title, kind, category: String(data.get("category")), account: String(data.get("account")), due: new Date(due + "T12:00:00").toLocaleDateString("pt-BR"), days: "novo", value: amount, status: "pendente" }, ...current]);
    setModalOpen(false); setAmount(0); notify(`Conta a ${kind} criada com sucesso.`);
  }
  function settle(title: string, itemKind: string) { setItems((current) => current.map((item) => item.title === title ? { ...item, status: itemKind === "receber" ? "recebido" : "pago", days: "liquidado" } : item)); notify(itemKind === "receber" ? "Recebimento confirmado." : "Pagamento confirmado."); }

  return (
    <>
      <PageHeader title="Contas a Pagar e Receber" subtitle="Junho · A pagar: R$ 4.840,00 · A receber: R$ 2.000,00" actions={<><Button variant="outline" icon={Plus} className="text-red-600" onClick={() => openForm("pagar")}>Nova conta a pagar</Button><Button variant="success" icon={Plus} onClick={() => openForm("receber")}>Nova conta a receber</Button></>} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[["A Vencer (7 dias)",2374.9,"3 contas"],["A Pagar (mês)",4840,"8 contas"],["A Receber (mês)",2000,"2 contas"],["Saldo Previsto",-2840,"após vencimentos"]].map(([title,value,meta]) => <Card key={String(title)}><p className="text-sm text-slate-500">{title}</p><Money className="mt-2 block text-2xl font-semibold" value={Number(value)} /><p className="mt-2 text-xs text-slate-500">{meta}</p></Card>)}</section>
      <Card className="mt-6"><div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("min-w-max rounded-md px-3 py-2 text-sm", tab === item ? "bg-white font-semibold text-primary shadow-sm" : "text-slate-600")}>{item}</button>)}</div><div className="mt-5 grid gap-3 md:grid-cols-3"><select className={inputClass}><option>Todos os status</option><option>Pendente</option><option>Vencido</option><option>Pago</option></select><input className={inputClass} value="Junho 2026" readOnly /><select className={inputClass}><option>Todas categorias</option></select></div></Card>
      <section className="mt-4 space-y-3">
        {filtered.length === 0 && <EmptyState icon={CreditCard} title="Nenhuma conta encontrada" subtitle="Ajuste os filtros ou cadastre uma nova conta a pagar ou receber." />}
        {filtered.map((item) => { const late = item.status === "vencido"; const paid = ["pago", "recebido"].includes(item.status); const income = item.kind === "receber"; return (
          <Card key={`${item.title}-${item.due}`} className={cn("border-l-4", late ? "border-l-red-500 bg-red-50/40" : paid ? "border-l-slate-300 opacity-75" : income ? "border-l-emerald-500" : "border-l-blue-500")}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><CreditCard className="h-5 w-5 text-slate-500" /><h2 className="font-semibold">{item.title}</h2><Badge variant={late ? "negative" : paid ? "positive" : income ? "info" : "warning"}>{income ? "A RECEBER" : "A PAGAR"}</Badge><Badge variant={late ? "negative" : paid ? "positive" : "neutral"}>{item.status.toUpperCase()}</Badge></div><p className="mt-2 text-sm text-slate-500">{item.category} · {item.account} · vencimento {item.due}</p></div><div className="flex flex-col gap-3 lg:items-end"><Money className="text-xl font-semibold" value={item.value} color={false} /><div className="flex flex-wrap gap-1">{!paid && <Button variant={income ? "success" : "primary"} onClick={() => settle(item.title, item.kind)}>{income ? "Marcar recebido" : "Marcar pago"}</Button>}<Button variant="ghost" icon={Edit} onClick={() => openForm(item.kind as "pagar" | "receber")} aria-label="Editar" /><Button variant="ghost" icon={Trash2} onClick={() => setDeleting(item.title)} aria-label="Excluir" /></div></div></div>
          </Card>
        ); })}
      </section>
      <Modal open={modalOpen} title={kind === "pagar" ? "Nova conta a pagar" : "Nova conta a receber"} onClose={() => setModalOpen(false)} footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" form="bill-form">Salvar conta</Button></>} size="lg">
        <form id="bill-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2"><Field label="Tipo"><select className={inputClass} value={kind} onChange={(event) => setKind(event.target.value as "pagar" | "receber")}><option value="pagar">A pagar</option><option value="receber">A receber</option></select></Field><Field label="Descrição"><input name="description" className={inputClass} required /></Field><Field label="Valor"><CurrencyInput onValueChange={setAmount} required /></Field><Field label="Data de vencimento"><input name="due" type="date" className={inputClass} required /></Field><Field label="Categoria"><select name="category" className={inputClass}><option>Moradia</option><option>Alimentação</option><option>Freelance</option><option>Serviços</option></select></Field><Field label="Conta associada"><select name="account" className={inputClass}><option>Nubank</option><option>Cartão</option><option>Poupança</option></select></Field><Field label="Contato"><input name="contact" className={inputClass} placeholder="Cliente ou fornecedor" /></Field><label className="flex h-11 items-center justify-between self-end rounded-lg border px-3 text-sm">Recorrente<input name="recurring" type="checkbox" /></label><div className="sm:col-span-2"><Field label="Observações"><textarea name="notes" className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm" /></Field></div></form>
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Excluir conta?" description={`A conta “${deleting ?? ""}” será removida da listagem.`} onClose={() => setDeleting(null)} onConfirm={() => { setItems((current) => current.filter((item) => item.title !== deleting)); setDeleting(null); notify("Conta excluída."); }} />
    </>
  );
}
