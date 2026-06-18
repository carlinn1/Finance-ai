import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "./ui";
import { cn } from "../lib/format";

type Toast = { id: number; message: string; type: "success" | "error" };
type FeedbackContextValue = { notify: (message: string, type?: Toast["type"]) => void };

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] grid w-[min(360px,calc(100vw-2rem))] gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={cn("flex items-start gap-3 rounded-lg border bg-white p-4 text-sm shadow-xl", toast.type === "success" ? "border-emerald-200" : "border-red-200")}>
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
            <span className="flex-1 text-slate-700">{toast.message}</span>
            <button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Fechar aviso"><X className="h-4 w-4 text-slate-400" /></button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback deve ser usado dentro de FeedbackProvider");
  return context;
}

export function Modal({ open, title, subtitle, onClose, children, footer, size = "md" }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" }) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0" onClick={onClose} aria-label="Fechar modal" />
      <section className={cn("relative max-h-[92vh] w-full overflow-y-auto rounded-lg border bg-white shadow-2xl", widths[size])}>
        <header className="sticky top-0 z-10 flex items-start justify-between border-b bg-white px-5 py-4">
          <div><h2 className="font-semibold text-slate-950">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
          <button className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t bg-white px-5 py-4">{footer}</footer>}
      </section>
    </div>
  );
}

export function ConfirmDialog({ open, title, description, onClose, onConfirm }: { open: boolean; title: string; description: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="sm" footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={onConfirm}>Confirmar exclusão</Button></>}>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </Modal>
  );
}
