import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Check,
  CircleDollarSign,
  Gauge,
  Menu,
  PieChart,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";

const benefits = [
  { icon: WalletCards, title: "Controle financeiro completo", text: "Todas as contas, cartões e movimentações organizadas em um só lugar." },
  { icon: CircleDollarSign, title: "Receitas e despesas", text: "Registre, importe e categorize seus lançamentos com muito menos esforço." },
  { icon: TrendingUp, title: "Fluxo de caixa inteligente", text: "Antecipe decisões com uma visão clara do realizado e do que vem pela frente." },
  { icon: ScanSearch, title: "Categorização por IA", text: "Sugestões automáticas que aprendem com seus hábitos e correções." },
  { icon: Target, title: "Metas financeiras", text: "Transforme planos em progresso mensurável com aportes e prazos realistas." },
  { icon: BarChart3, title: "Relatórios avançados", text: "DRE, evolução patrimonial e análises por categoria prontas para consultar." },
];

const aiFeatures = [
  { icon: Bot, title: "Chat financeiro", text: "Pergunte em linguagem natural e encontre respostas nos seus próprios dados." },
  { icon: Gauge, title: "Previsão de caixa", text: "Visualize cenários para os próximos 30, 60 e 90 dias." },
  { icon: ShieldCheck, title: "Alertas inteligentes", text: "Saiba antes quando um orçamento ou vencimento exigir atenção." },
  { icon: BrainCircuit, title: "Recomendações", text: "Receba ações práticas para economizar sem perder qualidade de vida." },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <BrandLogo className="h-10" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#beneficios" className="transition hover:text-slate-950">Benefícios</a>
            <a href="#inteligencia" className="transition hover:text-slate-950">Inteligência artificial</a>
            <a href="#produto" className="transition hover:text-slate-950">Produto</a>
            <a href="#planos" className="transition hover:text-slate-950">Planos</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Entrar</Link>
            <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Começar agora</Link>
          </div>
          <button className="rounded-lg p-2 text-slate-700 md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t bg-white px-4 py-4 md:hidden">
            <div className="grid gap-2 text-sm font-medium">
              <a href="#beneficios" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">Benefícios</a>
              <a href="#inteligencia" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">Inteligência artificial</a>
              <Link to="/login" className="rounded-lg px-3 py-2 hover:bg-slate-50">Fazer login</Link>
              <Link to="/register" className="rounded-lg bg-primary px-3 py-2 text-center text-white">Começar agora</Link>
            </div>
          </div>
        )}
      </header>

      <section className="relative flex min-h-[760px] items-center overflow-hidden border-b bg-slate-50 pt-16 lg:min-h-[820px]">
        <img src="/assets/financeai-dashboard-hero.png" alt="Dashboard financeiro com indicadores, gráficos e insights" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-white/68" />
        <div className="absolute inset-y-0 left-0 w-full bg-white/85 md:w-[60%] lg:w-[54%]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Inteligência financeira para decisões reais
            </div>
            <h1 className="mt-7 max-w-xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Assuma o controle das suas finanças com inteligência artificial
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Controle receitas, despesas e metas financeiras. Receba insights inteligentes para economizar mais e crescer com segurança.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white/90 px-6 text-sm font-semibold text-slate-800 transition hover:bg-white">
                Fazer login
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              {["14 dias grátis", "Sem cartão de crédito", "Dados protegidos"].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Tudo em ordem" title="Clareza para cuidar do presente e planejar o futuro" text="Uma operação financeira completa, organizada para você agir rápido sem perder contexto." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="group bg-white p-6 transition hover:bg-slate-50 sm:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="inteligencia" className="scroll-mt-20 border-y bg-slate-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading dark eyebrow="IA que trabalha com você" title="Do dado bruto à próxima melhor decisão" text="Insights explicáveis e acionáveis, sempre conectados ao seu contexto financeiro." />
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((item, index) => (
              <article key={item.title} className="border-t border-slate-700 pt-6">
                <span className="text-xs font-semibold text-blue-400">0{index + 1}</span>
                <item.icon className="mt-5 h-7 w-7 text-emerald-400" />
                <h3 className="mt-5 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="produto" className="scroll-mt-20 overflow-hidden py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Visão completa" title="Seu dinheiro explicado em uma única tela" text="Indicadores, contas, metas e alertas organizados para leitura rápida e decisões frequentes." />
          <div className="mt-12 overflow-hidden rounded-lg border bg-slate-50 p-2 shadow-2xl shadow-slate-900/10 sm:p-4">
            <img src="/assets/financeai-dashboard-hero.png" alt="Prévia detalhada do dashboard financeiro" className="w-full rounded-md" />
          </div>
        </div>
      </section>

      <section id="planos" className="scroll-mt-20 border-t bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Planos simples" title="Escolha como começar" text="Conheça tudo durante o trial e, quando fizer sentido, tenha acesso vitalício sem mensalidade." />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="rounded-lg border bg-white p-7 shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-slate-500">Plano Trial</p>
              <div className="mt-4 flex items-end gap-2"><strong className="text-4xl font-bold">Grátis</strong><span className="pb-1 text-sm text-slate-500">por 14 dias</span></div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Explore todos os recursos antes de decidir, sem informar cartão.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {["Acesso completo por tempo limitado", "IA, relatórios e previsões", "Importação de transações"].map((item) => <li key={item} className="flex gap-2"><Check className="h-5 w-5 text-emerald-600" />{item}</li>)}
              </ul>
              <Link to="/register" className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-300 font-semibold text-slate-800 hover:bg-slate-50">Começar teste grátis</Link>
            </article>
            <article className="relative rounded-lg border-2 border-primary bg-white p-7 shadow-xl shadow-blue-600/10 sm:p-8">
              <span className="absolute right-5 top-5 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-primary">Mais vantajoso</span>
              <p className="text-sm font-semibold text-primary">Licença Única</p>
              <div className="mt-4 flex items-end gap-2"><strong className="text-4xl font-bold">R$ 497</strong><span className="pb-1 text-sm text-slate-500">pagamento único</span></div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Pague uma vez e mantenha seu controle financeiro disponível para sempre.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {["Acesso vitalício", "Sem mensalidade", "Todos os módulos e atualizações"].map((item) => <li key={item} className="flex gap-2"><Check className="h-5 w-5 text-emerald-600" />{item}</li>)}
              </ul>
              <Link to="/register" className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">Comprar licença</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t bg-blue-50 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
          <PieChart className="h-9 w-9 text-primary" />
          <h2 className="mt-5 text-3xl font-bold tracking-normal sm:text-4xl">Comece hoje mesmo a transformar sua vida financeira.</h2>
          <p className="mt-4 max-w-2xl text-slate-600">Troque planilhas dispersas por uma rotina clara, inteligente e pronta para crescer com você.</p>
          <Link to="/register" className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Criar conta <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandLogo className="h-8" />
          <span>Controle, previsibilidade e decisões melhores.</span>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, text, dark = false }: { eyebrow: string; title: string; text: string; dark?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={dark ? "text-sm font-semibold text-blue-400" : "text-sm font-semibold text-primary"}>{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-bold tracking-normal sm:text-4xl ${dark ? "text-white" : "text-slate-950"}`}>{title}</h2>
      <p className={`mt-4 leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`}>{text}</p>
    </div>
  );
}
