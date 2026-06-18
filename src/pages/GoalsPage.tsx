import { useState, type FormEvent } from "react";
import { Calendar, MoreHorizontal, Plus, Target } from "lucide-react";
import { goals } from "../data/mock";
import { Badge, Button, Card, CurrencyInput, Field, Money, PageHeader, ProgressBar, inputClass } from "../components/ui";
import { Modal, useFeedback } from "../components/feedback";

export default function GoalsPage() {
  const [items, setItems] = useState(goals);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(0);
  const [saved, setSaved] = useState(0);
  const { notify } = useFeedback();
  const totalTarget = items.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = items.reduce((sum, goal) => sum + goal.saved, 0);

  function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get("name") || target <= 0 || !data.get("deadline")) return notify("Preencha nome, valor alvo e prazo.", "error");
    setItems((current) => [...current, { name: String(data.get("name")), saved, target, deadline: new Date(String(data.get("deadline")) + "T12:00:00").toLocaleDateString("pt-BR"), monthly: 0, forecast: "Em análise", status: "No prazo" }]);
    setOpen(false); setTarget(0); setSaved(0); notify("Meta criada com sucesso.");
  }

  return (
    <>
      <PageHeader title="Metas Financeiras" subtitle={`${items.filter((item) => item.status !== "Concluída").length} metas ativas · ${items.filter((item) => item.status === "Concluída").length} concluída`} actions={<Button icon={Plus} onClick={() => setOpen(true)}>Nova meta</Button>} />
      <section className="grid gap-4 md:grid-cols-3">
        <Summary label="Total almejado" value={totalTarget} />
        <Summary label="Total acumulado" value={totalSaved} detail={`${((totalSaved / totalTarget) * 100).toFixed(1).replace(".", ",")}% concluído`} />
        <Card><p className="text-sm text-slate-500">Metas no prazo</p><div className="mt-3"><Badge variant="positive">{items.filter((item) => item.status === "No prazo").length} no prazo</Badge></div></Card>
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {items.map((goal) => {
          const progress = Math.min((goal.saved / goal.target) * 100, 100); const remaining = Math.max(goal.target - goal.saved, 0); const done = goal.status === "Concluída"; const warning = goal.status === "Atenção";
          return (
            <Card key={goal.name} className={done ? "opacity-75" : "surface-hover"}>
              <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary"><Target className="h-5 w-5" /></span><div><h2 className="text-lg font-semibold">{goal.name}</h2><Badge variant={done ? "neutral" : warning ? "warning" : "positive"}>{goal.status}</Badge></div></div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Mais ações"><MoreHorizontal className="h-5 w-5" /></button></div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><Money className="text-3xl font-semibold text-primary" value={goal.saved} color={false} /><span className="ml-2 text-sm text-slate-500">de R$ {goal.target.toLocaleString("pt-BR")}</span></div><strong className="text-sm text-slate-700">{progress.toFixed(1).replace(".", ",")}%</strong></div>
              <div className="mt-4"><ProgressBar value={progress} color={done ? "bg-emerald-500" : warning ? "bg-amber-500" : "bg-blue-500"} /></div>
              <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3"><span><Calendar className="mr-1 inline h-4 w-4" />{goal.deadline}</span><span>Restante: <strong>R$ {remaining.toLocaleString("pt-BR")}</strong></span><span>Previsão: {goal.forecast}</span></div>
              <Button className="mt-5 w-full" variant={done ? "ghost" : "outline"}>{done ? "Ver histórico" : "Registrar aporte"}</Button>
            </Card>
          );
        })}
      </section>
      <Modal open={open} title="Nova meta financeira" subtitle="Defina o objetivo e acompanhe o progresso." onClose={() => setOpen(false)} footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" form="goal-form">Salvar meta</Button></>}>
        <form id="goal-form" className="grid gap-4" onSubmit={saveGoal}>
          <Field label="Nome da meta"><input name="name" className={inputClass} placeholder="Ex.: Entrada do apartamento" required /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Valor alvo"><CurrencyInput onValueChange={setTarget} required /></Field><Field label="Valor atual"><CurrencyInput onValueChange={setSaved} /></Field></div>
          <Field label="Prazo"><input name="deadline" type="date" className={inputClass} required /></Field>
          <Field label="Conta vinculada"><select name="account" className={inputClass}><option>Nubank</option><option>Poupança Caixa</option><option>Carteira de investimentos</option></select></Field>
          <Field label="Descrição"><textarea name="description" className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Por que esta meta é importante?" /></Field>
        </form>
      </Modal>
    </>
  );
}

function Summary({ label, value, detail }: { label: string; value: number; detail?: string }) { return <Card><p className="text-sm text-slate-500">{label}</p><Money className="mt-2 block text-2xl font-semibold" value={value} color={false} />{detail && <p className="mt-2 text-xs text-slate-500">{detail}</p>}</Card>; }
