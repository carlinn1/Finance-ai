import { cn } from "../lib/format";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <img
      src={compact ? "/assets/financeai-icon.png" : "/assets/financeai-wordmark.png"}
      alt="Finance AI"
      className={cn(compact ? "h-9 w-9 object-contain" : "h-9 w-auto object-contain", className)}
    />
  );
}
