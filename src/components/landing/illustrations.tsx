import { Icon } from "@/components/Icon";
import { ScoreCard } from "@/components/ScoreCard";
import { LogoMark, Meter, StatusBadge } from "@/components/ui";
import { brl, pct } from "@/lib/format";
import { PROFILE_LABEL, PROFILE_TONE } from "@/lib/report-builder";
import { scorePillars } from "@/lib/report-insights";
import { SAMPLE_ANSWERS, SAMPLE_DIAGNOSTIC } from "@/lib/sample";
import type { Profile } from "@/types/diagnostic";

const { report } = SAMPLE_DIAGNOSTIC;
const m = report.metrics;
const a = SAMPLE_ANSWERS;

/** Para onde vai um salário: o que já tem destino fixo, o resto e a sobra. */
export function IncomeBar() {
  const share = (v: number) => (v / m.income) * 100;
  const segments = [
    { label: "Moradia", value: a.housing, className: "bg-ink/80" },
    { label: "Despesas essenciais", value: a.essential, className: "bg-ink/80" },
    { label: "Parcelas", value: a.installments, className: "bg-ink/80" },
    { label: "Não essenciais", value: a.variable, className: "bg-muted/35" },
    { label: "Sobra", value: m.monthlyMargin, className: "bg-brand" },
  ];
  const committed = a.housing + a.essential + a.installments;

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_60px_-40px_rgba(20,23,20,0.4)] sm:p-7">
      <p className="text-[13px] font-medium text-muted">Exemplo: salário de {brl(m.income)}</p>

      <div className="mt-6">
        <div className="relative mb-3" style={{ width: `${share(committed)}%` }}>
          <p className="text-[13px] font-semibold">
            {brl(committed)} já têm destino antes do mês começar
          </p>
          <div className="mt-1.5 h-2 rounded-t-[4px] border-x-2 border-t-2 border-ink/80" />
        </div>
        <div className="flex h-10 w-full gap-0.5 overflow-hidden rounded-[6px]">
          {segments.map((s) => (
            <div key={s.label} className={s.className} style={{ width: `${share(s.value)}%` }} title={`${s.label}: ${brl(s.value)}`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[12px] tabular-nums text-muted">
          <span>R$ 0</span>
          <span>{brl(m.income)}</span>
        </div>
      </div>

      <ul className="mt-5 grid gap-x-6 gap-y-2.5 text-[14px] sm:grid-cols-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted">
              <span className={`size-2.5 shrink-0 rounded-[3px] ${s.className}`} />
              {s.label}
            </span>
            <span className={`font-semibold ${s.label === "Sobra" ? "text-brand-strong" : ""}`}>{brl(s.value)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-warn-soft/70 px-4 py-3">
        <Icon name="attention" className="size-5 shrink-0 text-warn-strong" />
        <p className="text-[14px] leading-snug">
          No fim do mês sobram só <strong>{brl(m.monthlyMargin)}</strong>, {pct(m.marginRate)} da renda.
        </p>
      </div>
    </div>
  );
}

export function StepAnswer() {
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <p className="text-[12px] font-medium text-muted">Quanto você recebe líquido por mês?</p>
      <div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-brand-strong bg-surface px-3 ring-4 ring-brand-soft">
        <span className="text-[15px] text-muted">R$</span>
        <span className="text-xl font-semibold tracking-tight">4.500</span>
        <span className="h-6 w-0.5 animate-blink bg-ink motion-reduce:animate-none" />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-track">
        <div className="h-full w-[30%] rounded-full bg-brand" />
      </div>
    </div>
  );
}

export function StepDiscover() {
  const tone = PROFILE_TONE[report.profile];
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <div className="flex items-end justify-between gap-2">
        <p className="leading-none">
          <span className="text-4xl font-semibold tracking-tighter">{report.score}</span>
          <span className="ml-1 text-sm text-muted">/ 100</span>
        </p>
        <span className="origin-bottom-right scale-90">
          <StatusBadge tone={tone}>{PROFILE_LABEL[report.profile]}</StatusBadge>
        </span>
      </div>
      <div className="mt-3">
        <Meter value={report.score / 100} tone={tone} label="Score do exemplo" />
      </div>
      <p className="mt-3 text-[12px] text-muted">
        Prioridade: <span className="font-semibold text-ink">Recuperar margem</span>
      </p>
    </div>
  );
}

export function StepOrganize() {
  return (
    <ul className="space-y-2 rounded-2xl bg-canvas p-4 text-[13px]">
      {report.plan30d.map((w) => w.title).map((t, i) => (
        <li key={t} className="flex items-center gap-2.5">
          <span
            className={`grid size-5 shrink-0 place-items-center rounded-full ${
              i < 2 ? "bg-brand-strong text-white" : "border-2 border-line bg-surface"
            }`}
          >
            {i < 2 ? <Icon name="check" className="size-3" strokeWidth={3.5} /> : null}
          </span>
          <span className="text-muted">
            <span className="font-semibold text-ink">Semana {i + 1}</span> · {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

const PROFILE_SCALE: [Profile, string][] = [
  ["NO_VERMELHO", "0–29"],
  ["NO_LIMITE", "30–49"],
  ["EM_AJUSTE", "50–69"],
  ["EM_EQUILIBRIO", "70–84"],
  ["EM_CONSTRUCAO", "85–100"],
];

const SCALE_DOT = { risk: "bg-risk", attention: "bg-warn", good: "bg-brand" } as const;

export function TileScore() {
  return (
    <>
      <ScoreCard score={report.score} profile={report.profile} />
      <ul className="mt-6 space-y-1.5 text-[14px]">
        {PROFILE_SCALE.map(([profile, range]) => {
          const active = profile === report.profile;
          return (
            <li
              key={profile}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${active ? "bg-canvas font-semibold" : "text-muted"}`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`size-2.5 rounded-full ${SCALE_DOT[PROFILE_TONE[profile]]}`} />
                {PROFILE_LABEL[profile]}
              </span>
              <span className="tabular-nums">{active ? "seu perfil" : range}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 hidden lg:block">
        <p className="text-[13px] font-semibold">De onde vêm seus pontos</p>
        <ul className="mt-3 space-y-2.5">
          {scorePillars(report).map((p) => (
            <li key={p.key} className="grid grid-cols-[96px_1fr_auto] items-center gap-3 text-[12.5px]">
              <span className="text-muted">{p.label}</span>
              <span className="h-2 overflow-hidden rounded-[3px] bg-track">
                <span
                  className="block h-full rounded-r-[3px] bg-brand"
                  style={{ width: `${(p.points / p.max) * 100}%`, opacity: p.points / p.max >= 0.7 ? 1 : 0.55 }}
                />
              </span>
              <span className="tabular-nums">
                <span className="font-semibold">{p.points}</span>
                <span className="text-muted">/{p.max}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function TileAlerts() {
  return (
    <ul className="space-y-2">
      {report.alerts.map((alert) => (
        <li key={alert.type} className="rounded-2xl border border-warn/40 bg-warn-soft/60 p-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Icon name="attention" className="size-4 shrink-0 text-warn-strong" />
            {alert.title}
          </p>
          <p className="mt-0.5 pl-5.5 text-[12px] text-muted">{alert.figure}</p>
        </li>
      ))}
    </ul>
  );
}

export function TileRoute() {
  return (
    <ol>
      {report.route.map((step, i) => {
        const last = i === report.route.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-3.5 last:pb-0">
            {!last ? <span className="absolute top-5 bottom-0 left-[9px] border-l-2 border-dashed border-brand/50" /> : null}
            <span
              className={`relative grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                last ? "bg-brand text-ink" : "bg-brand-soft text-brand-deep"
              }`}
            >
              {last ? <Icon name="check" className="size-3" strokeWidth={3.5} /> : i + 1}
            </span>
            <span className="text-[13px] leading-snug">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
                {step.horizon.replace("Seu destino · ", "Destino · ")}
              </span>
              <span className="font-semibold">{step.title}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function TilePlan() {
  const week = report.plan30d[0];
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-strong">Semana 1</p>
      <p className="text-[15px] font-semibold">{week.title}</p>
      <ul className="mt-2.5 space-y-2">
        {week.actions.map((action, i) => (
          <li key={action} className="flex gap-2 text-[12.5px] leading-snug">
            <span
              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded ${
                i === 0 ? "bg-brand-strong text-white" : "border-2 border-line bg-surface"
              }`}
            >
              {i === 0 ? <Icon name="check" className="size-2.5" strokeWidth={3.5} /> : null}
            </span>
            <span className="line-clamp-2">{action}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg bg-brand-soft/70 px-2.5 py-2 text-[12px]">
        <span className="font-semibold text-brand-deep">Meta: </span>
        {week.target}
      </p>
    </div>
  );
}

/** Capa do PDF atual (escura, com o medidor) sobre uma página interna. */
export function TilePdf() {
  const r = 34;
  const f = report.score / 100;
  const a = Math.PI * (1 - f);
  const end = { x: 45 + r * Math.cos(a), y: 44 - r * Math.sin(a) };
  return (
    <div className="relative mx-auto h-48 w-40">
      <div className="absolute top-3 left-9 h-44 w-32 rotate-[6deg] rounded-lg border border-line bg-surface p-3 shadow-[0_18px_40px_-24px_rgba(20,23,20,0.45)]">
        <p className="text-[6px] font-semibold uppercase tracking-[0.14em] text-brand-strong">06 · Sua rota</p>
        <div className="mt-2 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${i === 3 ? "bg-brand" : "bg-brand-soft"}`} />
              <span className="h-1 flex-1 rounded bg-track" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 h-44 w-32 rotate-[-5deg] overflow-hidden rounded-lg bg-ink p-3 text-white shadow-[0_22px_44px_-18px_rgba(20,23,20,0.6)]">
        <div className="absolute inset-0 bg-grid-light opacity-70" />
        <div className="relative">
          <div className="flex items-center gap-1">
            <LogoMark className="size-3.5" />
            <span className="text-[5.5px] font-semibold uppercase tracking-[0.16em]">Meu Mapa Financeiro</span>
          </div>
          <p className="mt-3 text-[6px] text-white/60">Diagnóstico financeiro de</p>
          <p className="text-[11px] font-semibold leading-tight">Mariana Souza</p>
          <svg viewBox="0 0 90 50" className="mx-auto mt-2 w-[84px]" aria-hidden="true">
            <path d="M 11 44 A 34 34 0 0 1 79 44" fill="none" stroke="#2A302B" strokeWidth="8" strokeLinecap="round" />
            <path d={`M 11 44 A 34 34 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`} fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
            <text x="45" y="43" textAnchor="middle" fill="#ffffff" fontSize="17" fontWeight="600">{report.score}</text>
          </svg>
          <p className="mx-auto mt-1 w-fit rounded-full bg-warn px-1.5 py-0.5 text-[5.5px] font-bold uppercase text-ink">
            No limite
          </p>
        </div>
      </div>
      <span className="absolute -right-1 -bottom-1 rounded-lg bg-brand-strong px-2 py-1 text-[10px] font-bold text-white">
        PDF · 8 páginas
      </span>
    </div>
  );
}
