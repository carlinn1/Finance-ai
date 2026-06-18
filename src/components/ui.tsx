import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn, formatMoney, formatSignedMoney } from "../lib/format";

export type BadgeVariant = "positive" | "negative" | "warning" | "neutral" | "info";

const badgeClass: Record<BadgeVariant, string> = {
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  negative: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1", badgeClass[variant])}>
      {children}
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  icon?: LucideIcon;
};

export function Button({ className, children, variant = "primary", icon: Icon, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700",
    secondary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };

  return (
    <button
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>{children}</section>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-slate-200/80 pb-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Money({
  value,
  signed = false,
  color = true,
  className,
}: {
  value: number;
  signed?: boolean;
  color?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "money",
        color && value > 0 && "text-emerald-600",
        color && value < 0 && "text-red-600",
        className,
      )}
    >
      {signed ? formatSignedMoney(value) : formatMoney(value)}
    </span>
  );
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  tone = "info",
  variation,
  footer,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: BadgeVariant;
  variation?: { label: string; variant: BadgeVariant };
  footer?: string;
}) {
  const iconTone: Record<BadgeVariant, string> = {
    positive: "bg-emerald-50 text-emerald-600",
    negative: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    neutral: "bg-slate-100 text-slate-600",
    info: "bg-blue-50 text-blue-600",
  };

  return (
    <Card className="surface-hover overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="money mt-3 text-2xl font-semibold text-slate-950">{formatMoney(value)}</p>
        </div>
        <div className={cn("rounded-lg p-2", iconTone[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex min-h-6 items-center justify-between gap-2 text-xs text-slate-500">
        {variation ? <Badge variant={variation.variant}>{variation.label}</Badge> : <span>{footer}</span>}
        {variation && footer ? <span>{footer}</span> : null}
      </div>
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }: { icon: LucideIcon; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center">
      <Icon className="h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} aria-hidden="true" />;
}

export function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function CurrencyInput({ initialValue = 0, onValueChange, required = false }: { initialValue?: number; onValueChange?: (value: number) => void; required?: boolean }) {
  const [value, setValue] = useState(initialValue);
  return (
    <input
      className={inputClass}
      inputMode="numeric"
      value={formatMoney(value)}
      required={required}
      onChange={(event) => {
        const cents = Number(event.target.value.replace(/\D/g, ""));
        const next = cents / 100;
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

export const inputClass =
  "focus-ring h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition hover:border-slate-400";
