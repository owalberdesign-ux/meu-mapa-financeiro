import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

export type Tone = "risk" | "attention" | "good";

export const buttonClass =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-strong px-5 py-3 text-center text-[15px] leading-tight font-semibold uppercase tracking-wide text-balance text-white shadow-[0_1px_0_rgba(0,0,0,0.08),0_8px_24px_-12px_rgba(21,128,61,0.7)] transition hover:bg-brand-deep active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

/** Mesmo botão, ocupando a largura toda em qualquer tela. */
export const buttonFullClass = buttonClass.replace(" sm:w-auto", "");

export const secondaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-5 text-[15px] font-semibold text-ink transition hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong sm:w-auto";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-strong"
      aria-label="Meu Mapa Financeiro — início"
    >
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight whitespace-nowrap">
        Meu Mapa <span className="font-normal text-muted">Financeiro</span>
      </span>
    </Link>
  );
}

/** Mapa dobrado com a rota e o pin de destino. Em fundo escuro, o pin fica branco. */
export function LogoMark({ className = "size-8", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M4 13.5 14 9.5v22L4 35.5z" fill="#15803d" />
      <path d="M14 9.5 26 13.5v22l-12-4z" fill="#22c55e" />
      <path d="M26 13.5 36 9.5v22l-10 4z" fill="#166534" />
      <path
        d="M8.2 29.6c3.4-1.6 4.6-4.9 8.2-5.2 3.5-.3 4.4 2.6 7.8 1.6 2.6-.8 3.5-3.6 5.4-5.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="0.1 3"
      />
      <circle cx="8.2" cy="29.6" r="1.7" fill="#ffffff" />
      <path
        d="M30 3.2c2.9 0 5.1 2.2 5.1 5 0 3.6-5.1 9.4-5.1 9.4s-5.1-5.8-5.1-9.4c0-2.8 2.2-5 5.1-5z"
        fill={onDark ? "#ffffff" : "#141714"}
        stroke={onDark ? "#141714" : "#f6f7f5"}
        strokeWidth="1.4"
      />
      <circle cx="30" cy="8.2" r="1.8" fill="#22c55e" />
    </svg>
  );
}

const TONE_BADGE: Record<Tone, string> = {
  risk: "bg-risk-soft text-risk-strong",
  attention: "bg-warn-soft text-warn-strong",
  good: "bg-brand-soft text-brand-deep",
};

const TONE_ICON = { risk: "risk", attention: "attention", good: "good" } as const;

const TONE_TEXT: Record<Tone, string> = {
  risk: "text-risk-strong",
  attention: "text-warn-strong",
  good: "text-brand-deep",
};

/** Rótulo de estado sem pílula: ícone + texto na cor do estado. */
export function ToneLabel({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <p className={`flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide ${TONE_TEXT[tone]}`}>
      <Icon name={TONE_ICON[tone]} className="size-4 shrink-0" strokeWidth={2.2} />
      {children}
    </p>
  );
}

export function StatusBadge({
  tone,
  compact = false,
  children,
}: {
  tone: Tone;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap uppercase tracking-wide ${TONE_BADGE[tone]} ${
        compact ? "gap-1 px-2 py-0.5 text-[9px]" : "gap-1.5 px-3 py-1 text-[13px]"
      }`}
    >
      <Icon name={TONE_ICON[tone]} className={compact ? "size-3" : "size-4"} strokeWidth={2.2} />
      {children}
    </span>
  );
}

const TONE_FILL: Record<Tone, string> = {
  risk: "bg-risk",
  attention: "bg-warn",
  good: "bg-brand",
};

const TONE_TRACK: Record<Tone, string> = {
  risk: "bg-risk-soft",
  attention: "bg-warn-soft",
  good: "bg-brand-soft",
};

/** Medidor de uma razão contra um limite: o preenchimento carrega o estado. */
export function Meter({
  value,
  tone,
  label,
}: {
  value: number;
  tone: Tone;
  label: string;
}) {
  const width = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className={`h-2.5 w-full overflow-hidden rounded-[4px] ${TONE_TRACK[tone]}`}
    >
      <div
        className={`h-full rounded-r-[4px] transition-[width] duration-700 ease-out ${TONE_FILL[tone]}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-3xl border border-line bg-surface p-5 sm:p-6 print:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
      {children}
    </p>
  );
}

export function Stat({
  label,
  value,
  note,
  valueClassName = "",
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-canvas p-4">
      <p className="text-[13px] text-muted">{label}</p>
      {/* Valores alinhados pela base quando o rótulo quebra em duas linhas. */}
      <div className="mt-auto pt-1">
        <p className={`text-xl font-semibold tracking-tight ${valueClassName}`}>{value}</p>
        {note ? <p className="mt-0.5 text-[13px] text-muted">{note}</p> : null}
      </div>
    </div>
  );
}
