import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Eye, Github, Lock, Mail, Shield, User } from "lucide-react";
import { Badge, Button, Card, Field, inputClass } from "../components/ui";
import { cn } from "../lib/format";
import { BrandLogo } from "../components/BrandLogo";

function BrandMark({ light = false }: { light?: boolean }) {
  if (light) {
    return <div className="inline-flex rounded-lg bg-white px-3 py-2 shadow-lg"><BrandLogo className="h-9" /></div>;
  }
  return <BrandLogo className="h-11" />;
}

export function LoginPage() {
  const navigate = useNavigate();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/dashboard");
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
                <input className={cn(inputClass, "pl-10")} type="email" placeholder="joao@exemplo.com.br" />
              </div>
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input className={cn(inputClass, "pl-10 pr-10")} type="password" placeholder="Sua senha" />
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
            <Button className="h-11 w-full shadow-lg shadow-blue-600/15" type="submit">
              Entrar
            </Button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              ou continue com
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline">
                G Google
              </Button>
              <Button type="button" variant="outline" icon={Github}>
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
          onSubmit={(event) => {
            event.preventDefault();
            navigate("/dashboard");
          }}
        >
          <Field label="Nome completo">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input className={cn(inputClass, "pl-10")} placeholder="João Ferreira" />
            </div>
          </Field>
          <Field label="E-mail">
            <input className={inputClass} type="email" placeholder="joao@exemplo.com.br" />
          </Field>
          <Field label="Senha">
            <input className={inputClass} type="password" placeholder="Mínimo 8 caracteres" />
            <div className="mt-2 h-1.5 rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-amber-500" />
            </div>
            <p className="mt-1 text-xs text-amber-700">Força média</p>
          </Field>
          <Field label="Confirmar senha">
            <input className={inputClass} type="password" />
          </Field>
          <Field label="Perfil de uso">
            <select className={inputClass}>
              <option>Pessoa Física</option>
              <option>MEI / Autônomo</option>
              <option>Empresa (PME)</option>
            </select>
          </Field>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary" />
            Concordo com os Termos de Uso e Política de Privacidade
          </label>
          <Button className="w-full" type="submit">
            Criar conta
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline">
              G Google
            </Button>
            <Button type="button" variant="outline" icon={Github}>
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
                <input className={inputClass} type="email" />
              </Field>
            </div>
            <Button className="mt-4 w-full" onClick={() => setSent(true)}>
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
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-sm text-center shadow-soft">
        <Shield className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold">Verificação em dois fatores</h1>
        <p className="mt-2 text-sm text-slate-500">Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
        <div className="mt-6 grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <input key={index} className="focus-ring h-12 rounded-lg border bg-white text-center text-lg font-semibold" maxLength={1} />
          ))}
        </div>
        <Button className="mt-6 w-full">Verificar</Button>
        <Link className="mt-4 block text-sm font-medium text-primary" to="/login">
          Voltar
        </Link>
      </Card>
    </main>
  );
}
