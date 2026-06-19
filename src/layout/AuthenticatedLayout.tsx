import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Bell,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Settings,
  Target,
  X,
} from "lucide-react";
import { Badge, LoadingSpinner } from "../components/ui";
import { cn } from "../lib/format";
import { useFeedback } from "../components/feedback";
import { BrandLogo } from "../components/BrandLogo";
import { api, clearTokens, hasSession, type User as SessionUser } from "../lib/api";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/contas-pagar-receber", label: "Contas", icon: CreditCard },
  { to: "/orcamento", label: "Orçamento", icon: PieChart },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/ia", label: "IA Assistente", icon: BotMessageSquare, badge: "IA" },
];

export default function AuthenticatedLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { notify } = useFeedback();

  useEffect(() => {
    const loadUser = async () => {
      if (!hasSession()) { navigate("/login", { replace: true }); setCheckingSession(false); return; }
      try { setSessionUser(await api<SessionUser>("/users/me")); }
      catch { clearTokens(); navigate("/login", { replace: true }); }
      finally { setCheckingSession(false); }
    };
    const expired = () => { clearTokens(); navigate("/login", { replace: true }); };
    void loadUser();
    window.addEventListener("financeai:user-updated", loadUser);
    window.addEventListener("financeai:session-expired", expired);
    return () => { window.removeEventListener("financeai:user-updated", loadUser); window.removeEventListener("financeai:session-expired", expired); };
  }, [navigate]);

  async function logout() {
    const refresh_token = localStorage.getItem("refresh_token");
    try { await api("/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token }) }); } catch { /* sessão local também deve ser encerrada */ }
    clearTokens();
    sessionStorage.clear();
    notify("Sessão encerrada com segurança.");
    navigate("/login", { replace: true });
  }

  if (checkingSession) return <LoadingSpinner />;
  if (!sessionUser) return null;

  const initials = sessionUser.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className={cn("min-h-screen bg-slate-50 lg:grid", collapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[248px_1fr]")}> 
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur lg:hidden">
        <button className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setMobileOpen(true)} aria-label="Abrir navegação">
          <Menu className="h-5 w-5" />
        </button>
        <Brand compact />
        <button className="focus-ring relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </header>

      {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar navegação" />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[280px] -translate-x-full flex-col border-r bg-white shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none",
        mobileOpen && "translate-x-0",
      )}>
        <div className={cn("flex h-16 items-center border-b px-4", collapsed ? "lg:justify-center" : "justify-between")}>
          <Brand compact={collapsed} />
          <button className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className={cn("mb-2 px-3 text-[11px] font-semibold uppercase text-slate-400", collapsed && "lg:hidden")}>Visão financeira</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                isActive ? "bg-blue-50 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                collapsed && "lg:justify-center lg:px-0",
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                  {item.badge && <span className={cn("ml-auto", collapsed && "lg:hidden")}><Badge variant="info">{item.badge}</Badge></span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <NavLink
            to="/configuracoes"
            title={collapsed ? "Configurações" : undefined}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              "mb-3 flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
              isActive ? "bg-blue-50 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              collapsed && "lg:justify-center lg:px-0",
            )}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Configurações</span>
          </NavLink>
          <div className={cn("flex items-center gap-3 rounded-lg border bg-slate-50 p-3", collapsed && "lg:justify-center lg:border-0 lg:bg-transparent lg:p-0")}>
            {sessionUser.avatar_url ? <img src={sessionUser.avatar_url} alt={`Foto de ${sessionUser.full_name}`} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{initials}</div>}
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-semibold text-slate-900">{sessionUser.full_name}</p>
              <p className="mt-0.5 text-xs text-emerald-700">Sessão protegida</p>
            </div>
          </div>
          <button onClick={logout} title={collapsed ? "Sair da conta" : undefined} className={cn("mt-2 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700", collapsed && "lg:justify-center lg:px-0")}>
            <LogOut className="h-[18px] w-[18px] shrink-0" /><span className={cn(collapsed && "lg:hidden")}>Sair da conta</span>
          </button>
        </div>

        <button
          className="focus-ring absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border bg-white text-slate-500 shadow-sm hover:text-slate-900 lg:flex"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-7">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <BrandLogo compact={compact} className={cn(!compact && "max-w-[170px]")} />;
}
