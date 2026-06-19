import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Eye, Github, Lock, Mail, Shield, User } from "lucide-react";
import { Badge, Button, Card, Field, inputClass } from "../components/ui";
import { cn } from "../lib/format";
import { BrandLogo } from "../components/BrandLogo";
import { api, saveTokens } from "../lib/api";
import { useFeedback } from "../components/feedback";

function BrandMark({ light = false }: { light?: boolean }) {
  if (light) {
    return <div className="inline-flex rounded-lg bg-white px-3 py-2 shadow-lg"><BrandLogo className="h-9" /></div>;
  }
  return <BrandLogo className="h-11" />;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api<{ tokens?: Parameters<typeof saveTokens>[0]; requires_2fa?: boolean; challenge_token?: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (result.requires_2fa && result.challenge_token) {
        sessionStorage.setItem("two_factor_challenge", result.challenge_token);
        navigate("/two-factor");
        return;
      }
      if (result.tokens) saveTokens(result.tokens);
      navigate("/dashboard");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível entrar.", "error"); }
    finally { setLoading(false); }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[52fr_48fr]">
      <section className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col">
        <img src="/assets/financeai-dashboard-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-slate-950/72" />
        <div className="relative"><BrandMark light /></div>
        <div className="relative my-auto max-w-lg">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">Controle financeiro com IA</span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-normal xl:text-5xl">Suas finanças, inteligentes e sob controle.</h1>
          <p className="mt-4 max-w-md text-lg leading-7 text-slate-300">Uma visão clara para organizar o presente, antecipar riscos e alcançar seus planos.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-200">
            {["Categorização automática por IA", "Previsão de fluxo de caixa", "Alertas e recomendações personalizadas"].map((item) => (
              <p key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15"><Check className="h-4 w-4 text-emerald-300" /></span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 p-6 lg:bg-white lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          <Link to="/" className="mb-8 inline-flex text-sm font-medium text-slate-500 hover:text-slate-900">Voltar ao início</Link>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-slate-500">Acesse sua visão financeira para continuar.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="E-mail">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input className={cn(inputClass, "pl-10")} type="email" placeholder="voce@exemplo.com.br" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input className={cn(inputClass, "pl-10 pr-10")} type="password" placeholder="Sua senha" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <Eye className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
              </div>
            </Field>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary" />
                Lembrar de mim
              </label>
              <Link className="font-medium text-primary" to="/forgot-password">
                Esqueci minha senha
              </Link>
            </div>
            <Button className="h-11 w-full shadow-lg shadow-blue-600/15" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              ou continue com
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" disabled title="Configure OAuth no backend para habilitar">
                G Google
              </Button>
              <Button type="button" variant="outline" icon={Github} disabled title="Configure OAuth no backend para habilitar">
                GitHub
              </Button>
            </div>
            <p className="text-center text-sm text-slate-500">
              Não tem conta?{" "}
              <Link className="font-medium text-primary" to="/register">
                Criar conta grátis
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [loading, setLoading] = useState(false);
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-md shadow-soft">
        <div className="flex flex-col items-center text-center">
          <BrandMark />
          <h1 className="mt-6 text-2xl font-semibold tracking-normal">Criar sua conta</h1>
          <div className="mt-3">
            <Badge variant="info">14 dias grátis, sem cartão de crédito</Badge>
          </div>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            if (data.get("password") !== data.get("password_confirmation")) return notify("As senhas não coincidem.", "error");
            setLoading(true);
            try {
              const result = await api<{ tokens: Parameters<typeof saveTokens>[0] }>("/auth/register", { method: "POST", body: JSON.stringify({ full_name: data.get("full_name"), email: data.get("email"), password: data.get("password"), profile_type: data.get("profile_type") }) });
              saveTokens(result.tokens); navigate("/dashboard");
            } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível criar a conta.", "error"); }
            finally { setLoading(false); }
          }}
        >
          <Field label="Nome completo">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input name="full_name" className={cn(inputClass, "pl-10")} placeholder="Seu nome completo" required />
            </div>
          </Field>
          <Field label="E-mail">
            <input name="email" className={inputClass} type="email" placeholder="voce@exemplo.com.br" required />
          </Field>
          <Field label="Senha">
            <input name="password" className={inputClass} type="password" placeholder="8+ caracteres, maiúscula, número e símbolo" required />
            <div className="mt-2 h-1.5 rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-amber-500" />
            </div>
            <p className="mt-1 text-xs text-amber-700">Força média</p>
          </Field>
          <Field label="Confirmar senha">
            <input name="password_confirmation" className={inputClass} type="password" required />
          </Field>
          <Field label="Perfil de uso">
            <select name="profile_type" className={inputClass}>
              <option value="personal">Pessoa Física</option>
              <option value="self_employed">MEI / Autônomo</option>
              <option value="business">Empresa (PME)</option>
            </select>
          </Field>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary" required />
            Concordo com os Termos de Uso e Política de Privacidade
          </label>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" disabled title="Configure OAuth no backend para habilitar">
              G Google
            </Button>
            <Button type="button" variant="outline" icon={Github} disabled title="Configure OAuth no backend para habilitar">
              GitHub
            </Button>
          </div>
          <p className="text-center text-sm text-slate-500">
            Já tenho conta.{" "}
            <Link className="font-medium text-primary" to="/login">
              Entrar
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const { notify } = useFeedback();
  async function send() {
    try { await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }); setSent(true); }
    catch (error) { notify(error instanceof Error ? error.message : "Falha ao enviar.", "error"); }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-sm text-center shadow-soft">
        {sent ? (
          <>
            <Mail className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-semibold">E-mail enviado!</h1>
            <p className="mt-2 text-sm text-slate-500">Verifique sua caixa de entrada. O link expira em 1 hora.</p>
            <Button className="mt-6 w-full" variant="outline" onClick={() => setSent(false)}>
              Reenviar e-mail
            </Button>
          </>
        ) : (
          <>
            <Lock className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-semibold">Recuperar senha</h1>
            <p className="mt-2 text-sm text-slate-500">Enviaremos um link de redefinição para seu e-mail.</p>
            <div className="mt-6 text-left">
              <Field label="E-mail cadastrado">
                <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </Field>
            </div>
            <Button className="mt-4 w-full" onClick={send}>
              Enviar link de recuperação
            </Button>
          </>
        )}
        <Link className="mt-5 inline-block text-sm font-medium text-primary" to="/login">
          Voltar ao login
        </Link>
      </Card>
    </main>
  );
}

export function TwoFactorPage() {
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [code, setCode] = useState("");
  async function verify() {
    const challenge_token = sessionStorage.getItem("two_factor_challenge");
    if (!challenge_token) return navigate("/login");
    try {
      const result = await api<{ tokens: Parameters<typeof saveTokens>[0] }>("/auth/2fa/login", { method: "POST", body: JSON.stringify({ challenge_token, code }) });
      saveTokens(result.tokens); sessionStorage.removeItem("two_factor_challenge"); navigate("/dashboard");
    } catch (error) { notify(error instanceof Error ? error.message : "Código inválido.", "error"); }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-sm text-center shadow-soft">
        <Shield className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold">Verificação em dois fatores</h1>
        <p className="mt-2 text-sm text-slate-500">Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
        <input className={cn(inputClass, "mt-6 text-center text-xl tracking-[0.4em]")} inputMode="numeric" autoFocus maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
        <Button className="mt-6 w-full" onClick={verify} disabled={code.length !== 6}>Verificar</Button>
        <Link className="mt-4 block text-sm font-medium text-primary" to="/login">
          Voltar
        </Link>
      </Card>
    </main>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation")) return notify("As senhas não coincidem.", "error");
    setLoading(true);
    try { await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token: params.get("token"), password: data.get("password") }) }); notify("Senha redefinida com sucesso."); navigate("/login"); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível redefinir a senha.", "error"); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-bg p-6"><Card className="w-full max-w-sm shadow-soft"><h1 className="text-2xl font-semibold">Criar nova senha</h1><form className="mt-6 space-y-4" onSubmit={submit}><Field label="Nova senha"><input name="password" className={inputClass} type="password" required /></Field><Field label="Confirmar senha"><input name="confirmation" className={inputClass} type="password" required /></Field><Button className="w-full" type="submit" disabled={loading}>{loading ? "Salvando..." : "Redefinir senha"}</Button></form></Card></main>;
}
