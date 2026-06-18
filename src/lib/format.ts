export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatMoney(value: number) {
  return brlFormatter.format(value);
}

export function formatSignedMoney(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatMoney(value)}`;
}

export function percent(value: number) {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: value % 1 ? 1 : 0,
    maximumFractionDigits: 1,
  })}%`;
}
