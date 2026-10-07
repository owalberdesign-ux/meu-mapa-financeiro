const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** R$ 4.500 — sempre em reais inteiros, sem "-R$ 0". */
export function brl(value: number): string {
  return currency.format(Math.round(value) || 0);
}

/** 85,6% */
export function pct(ratio: number): string {
  return percent.format(ratio);
}

/** 0,3× */
export function times(ratio: number): string {
  return `${decimal.format(ratio)}×`;
}

/** 4.500 (para campos de valor) */
export function thousands(value: number): string {
  return integer.format(value);
}

/** "1 mês", "2,5 meses", "17 dias" */
export function duration(months: number): string {
  if (months < 1) {
    const days = Math.round(months * 30);
    return days === 1 ? "1 dia" : `${days} dias`;
  }
  const rounded = Math.round(months * 10) / 10;
  return rounded === 1 ? "1 mês" : `${decimal.format(rounded)} meses`;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** 07/10/2026 */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}
