import type { ReactNode } from "react";
import type { Diagnostic, PrimaryProblem, Report } from "@/types/diagnostic";
import { Icon } from "@/components/Icon";
import { PdfButton } from "@/components/PdfButton";
import { ScoreCard } from "@/components/ScoreCard";
import { Card, LogoMark, Stat, StatusBadge, ToneLabel, buttonClass, type Tone } from "@/components/ui";
import { brl, duration, firstName, pct, shortDate } from "@/lib/format";
import { DISCLAIMER, PROJECTION_DISCLAIMER } from "@/lib/legal";
import {
  GOAL_LABEL,
  PLAN_TITLE,
  PRIMARY_PROBLEM_TEXT,
  PRIORITY_LABEL,
  PROFILE_LABEL,
} from "@/lib/report-builder";

function problemTone(problem: PrimaryProblem): Tone {
  if (problem === "DEFICIT" || problem === "DEBT") return "risk";
  return problem === "NONE" ? "good" : "attention";
}

const CALLOUT: Record<Tone, string> = {
  risk: "border-risk/30 bg-risk-soft/60",
  attention: "border-warn/40 bg-warn-soft/60",
  good: "border-brand/40 bg-brand-soft/60",
};

function SectionTitle({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline gap-3 print:mb-3">
      <span className="text-sm font-semibold tabular-nums text-brand-strong">{index}</span>
      <h2 className="text-2xl font-semibold tracking-tight">{children}</h2>
    </div>
  );
}

function MarginValue({ margin }: { margin: number }) {
  return (
    <span className={margin < 0 ? "text-risk-strong" : undefined}>
      {margin < 0 ? `−${brl(-margin)}` : brl(margin)}
    </span>
  );
}

/** Prioridade principal com estado (ícone + rótulo, não só cor). */
export function PriorityCallout({ report }: { report: Report }) {
  const tone = problemTone(report.primaryProblem);
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${CALLOUT[tone]}`}>
      <ToneLabel tone={tone}>Sua prioridade</ToneLabel>
      <p className="mt-2 text-xl font-semibold tracking-tight">{PRIORITY_LABEL[report.primaryProblem]}</p>
      <p className="mt-1.5 text-[16px] leading-relaxed text-ink/80">
        {PRIMARY_PROBLEM_TEXT[report.primaryProblem]}
      </p>
    </div>
  );
}

export function KeyNumbers({ report }: { report: Report }) {
  const m = report.metrics;
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Stat label="Renda" value={brl(m.income)} />
      <Stat label="Despesas" value={brl(m.totalExpenses)} />
      <Stat
        label={m.monthlyMargin < 0 ? "Margem (déficit)" : "Margem"}
        value={<MarginValue margin={m.monthlyMargin} />}
        note="por mês"
      />
      <Stat label="Comprometimento" value={pct(m.commitmentRate)} note="da renda" />
    </div>
  );
}

/** Pré-diagnóstico gratuito (briefing, seção 26). */
export function PreviewResult({ diagnostic }: { diagnostic: Diagnostic }) {
  const { report } = diagnostic;
  return (
    <Card>
      <ScoreCard score={report.score} profile={report.profile} animate />
      <div className="mt-6">
        <KeyNumbers report={report} />
      </div>
      <div className="mt-4">
        <PriorityCallout report={report} />
      </div>
    </Card>
  );
}

function lockedItems(report: Report): string[] {
  const n = report.alerts.length;
  const attention =
    n === 0
      ? "A leitura completa dos seus indicadores"
      : n === 1
        ? "Seu principal ponto de atenção"
        : `Seus ${n} maiores pontos de atenção`;
  return [
    attention,
    "Quanto você pode recuperar por mês",
    "Sua projeção de 3, 6 e 12 meses",
    "Seu plano personalizado de 30 dias",
    "Seu relatório completo em PDF",
  ];
}

/** Conteúdo bloqueado + CTA de compra (briefing, seções 27 e 55). */
export function LockedReport({
  report,
  cta,
}: {
  report: Report;
  cta: ReactNode;
}) {
  const heading =
    report.alerts.length > 0
      ? "Seu Raio-X completo encontrou pontos que podem estar impedindo seu dinheiro de sobrar."
      : "Seu Raio-X completo mostra como transformar sua margem em reserva.";
  return (
    <div className="rounded-[2rem] bg-ink p-6 text-white sm:p-8">
      <h2 className="text-2xl font-semibold leading-snug tracking-tight text-balance">{heading}</h2>
      <ul className="mt-6 space-y-3">
        {lockedItems(report).map((item) => (
          <li key={item} className="flex items-center gap-3 text-[16px] text-white/85">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-brand">
              <Icon name="lock" className="size-4" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  );
}

export function ReadyBanner({ diagnostic }: { diagnostic: Diagnostic }) {
  return (
    <div className="rounded-[2rem] bg-ink p-6 text-white sm:p-8 print:hidden">
      <span className="grid size-11 place-items-center rounded-2xl bg-brand text-ink">
        <Icon name="good" className="size-6" />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">Seu Raio-X está pronto.</h1>
      <p className="mt-2 text-white/75">
        {firstName(diagnostic.name)}, seu diagnóstico completo foi liberado.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href="#relatorio" className={buttonClass}>
          Abrir meu relatório
          <Icon name="arrowRight" />
        </a>
        <PdfButton
          diagnostic={diagnostic}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 text-[15px] font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 sm:w-auto"
        />
      </div>
    </div>
  );
}

function AlertsSection({ report }: { report: Report }) {
  if (report.alerts.length === 0) {
    return (
      <div className={`rounded-2xl border p-5 ${CALLOUT.good}`}>
        <StatusBadge tone="good">Sem pontos críticos</StatusBadge>
        <p className="mt-3 text-[17px] leading-relaxed">
          Nenhum dos seus indicadores está em faixa de atenção. O foco agora é manter a constância.
        </p>
      </div>
    );
  }
  return (
    <ol className="grid gap-3">
      {report.alerts.map((alert, i) => (
        <li
          key={alert.type}
          className={`rounded-2xl border p-5 print:break-inside-avoid ${CALLOUT[alert.severity]}`}
        >
          <div className="flex items-center justify-between gap-3">
            <StatusBadge tone={alert.severity}>
              {alert.severity === "risk" ? "Risco" : "Atenção"}
            </StatusBadge>
            <span className="text-sm font-semibold tabular-nums text-muted">{i + 1}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight">{alert.title}</h3>
          <p className="mt-1 text-[17px] font-semibold">{alert.figure}</p>
          <p className="mt-2 leading-relaxed text-muted">{alert.text}</p>
        </li>
      ))}
    </ol>
  );
}

function DistributionRow({
  label,
  value,
  share,
  barClass,
  valueClass = "",
}: {
  label: string;
  value: ReactNode;
  share: number;
  barClass: string;
  valueClass?: string;
}) {
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px]">{label}</span>
        <span className="text-right">
          <span className={`text-[17px] font-semibold ${valueClass}`}>{value}</span>
          <span className="ml-2 text-[13px] tabular-nums text-muted">{pct(share)}</span>
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full rounded-[4px] bg-track">
        <div
          className={`h-full rounded-r-[4px] ${barClass}`}
          style={{ width: `${Math.min(100, Math.max(share > 0 ? 1.5 : 0, share * 100))}%` }}
        />
      </div>
    </li>
  );
}

function DistributionSection({ diagnostic }: { diagnostic: Diagnostic }) {
  const { answers, report } = diagnostic;
  const m = report.metrics;
  const share = (v: number) => (m.income > 0 ? v / m.income : 0);
  const deficit = m.monthlyMargin < 0;
  const target = report.adjustment.reductionTarget;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="print:break-inside-avoid">
        <h3 className="text-lg font-semibold">Para onde vai sua renda</h3>
        <p className="mt-1 text-sm text-muted">Cada barra é a fatia da renda de {brl(m.income)}.</p>
        <ul className="mt-2 divide-y divide-line">
          <DistributionRow label="Moradia" value={brl(answers.housing)} share={share(answers.housing)} barClass="bg-muted/45" />
          <DistributionRow label="Despesas essenciais" value={brl(answers.essential)} share={share(answers.essential)} barClass="bg-muted/45" />
          <DistributionRow label="Gastos não essenciais" value={brl(answers.variable)} share={share(answers.variable)} barClass="bg-muted/45" />
          <DistributionRow label="Parcelas" value={brl(answers.installments)} share={share(answers.installments)} barClass="bg-muted/45" />
          <DistributionRow
            label={deficit ? "Falta no mês" : "Sobra no mês"}
            value={<MarginValue margin={m.monthlyMargin} />}
            share={share(Math.abs(m.monthlyMargin))}
            barClass={deficit ? "bg-risk" : "bg-brand"}
          />
        </ul>
      </Card>

      <Card className="print:break-inside-avoid">
        <h3 className="text-lg font-semibold">Potencial de ajuste</h3>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Stat label="Gastos não essenciais" value={brl(answers.variable)} note="por mês" />
          <Stat
            label="Meta sugerida"
            value={<span className="text-brand-strong">−{brl(target)}</span>}
            note="12% desses gastos"
          />
        </div>
        <p className="mt-4 leading-relaxed text-muted">
          Com uma redução moderada dos gastos variáveis e preservando sua margem atual, existe espaço
          para melhorar seu fluxo mensal.
        </p>
        <div className="mt-4 rounded-2xl bg-brand-soft/60 p-4">
          <p className="text-[13px] text-brand-deep">
            {deficit ? "Quanto o ajuste libera por mês" : "Seu potencial por mês"}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {brl(report.projection.monthlyPotential)}
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {deficit
              ? `Hoje faltam ${brl(-m.monthlyMargin)} por mês: esse valor ajuda primeiro a cobrir a diferença.`
              : `${brl(m.monthlyMargin)} de margem atual + ${brl(target)} do ajuste sugerido.`}
          </p>
        </div>
      </Card>
    </div>
  );
}

function ProjectionSection({ report }: { report: Report }) {
  const p = report.projection;
  const deficit = report.metrics.monthlyMargin < 0;
  const tiles = [
    ["3 meses", p.threeMonths],
    ["6 meses", p.sixMonths],
    ["12 meses", p.twelveMonths],
  ] as const;
  return (
    <Card className="print:break-inside-avoid">
      <p className="leading-relaxed text-muted">
        {deficit
          ? "Valor que o ajuste sugerido libera ao longo do tempo. Enquanto houver déficit, ele serve primeiro para cobrir a diferença do mês."
          : "Se você mantiver a margem atual e fizer o ajuste sugerido, este é o valor que pode ficar com você:"}
      </p>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-3 rounded-2xl bg-canvas px-4 py-3.5 sm:block sm:p-4"
          >
            <p className="text-[15px] text-muted sm:text-[13px]">Em {label}</p>
            <p className="text-2xl font-semibold tracking-tight sm:mt-1">{brl(value)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">{PROJECTION_DISCLAIMER}</p>
    </Card>
  );
}

function PlanSection({ report }: { report: Report }) {
  return (
    <>
      <p className="-mt-2 mb-4 text-muted">{PLAN_TITLE[report.planFocus]}</p>
      <ol className="grid gap-3 sm:grid-cols-2">
        {report.plan30d.map((w) => (
          <li key={w.week} className="rounded-2xl border border-line bg-surface p-5 print:break-inside-avoid">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
              Semana {w.week}
            </p>
            <p className="mt-2 text-[17px] leading-relaxed">{w.text}</p>
            {w.detail ? (
              <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[15px] font-medium">{w.detail}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}

function PrintCover({ diagnostic }: { diagnostic: Diagnostic }) {
  const { report } = diagnostic;
  return (
    <section className="hidden h-[255mm] flex-col justify-between print:flex">
      <div className="flex items-center gap-3">
        <LogoMark className="size-10" />
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">Raio-X do Dinheiro</p>
      </div>
      <div>
        <p className="text-lg text-muted">Diagnóstico de</p>
        <p className="text-5xl font-semibold tracking-tight">{diagnostic.name}</p>
        <div className="mt-12 flex items-end gap-6">
          <p className="leading-none">
            <span className="text-8xl font-semibold tracking-tighter">{report.score}</span>
            <span className="ml-2 text-3xl text-muted">/ 100</span>
          </p>
          <div className="pb-2">
            <p className="text-sm text-muted">Perfil</p>
            <p className="text-2xl font-semibold">{PROFILE_LABEL[report.profile]}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted">{shortDate(diagnostic.createdAt)}</p>
    </section>
  );
}

/** Relatório completo (briefing, seção 32). É também o PDF, via impressão. */
export function FullReport({ diagnostic }: { diagnostic: Diagnostic }) {
  const { report, answers } = diagnostic;
  const m = report.metrics;

  return (
    <article id="relatorio" className="scroll-mt-6 space-y-12 print:space-y-6">
      <PrintCover diagnostic={diagnostic} />

      <section className="print:break-before-page">
        <SectionTitle index="01">Resultado</SectionTitle>
        <Card className="print:break-inside-avoid">
          <ScoreCard score={report.score} profile={report.profile} />
          <div className="mt-5">
            <PriorityCallout report={report} />
          </div>
          <p className="mt-4 text-[15px] text-muted">
            Seu objetivo: <span className="font-semibold text-ink">{GOAL_LABEL[report.goal]}</span>
          </p>
        </Card>
      </section>

      <section className="print:break-inside-avoid">
        <SectionTitle index="02">Seus números</SectionTitle>
        <Card className="print:break-inside-avoid">
          <KeyNumbers report={report} />
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <Stat
              label="Parcelas"
              value={brl(answers.installments)}
              note={`${pct(m.installmentRate)} da renda`}
            />
            <Stat
              label="Dívidas vencidas"
              value={m.debt > 0 ? brl(m.debt) : "Nenhuma"}
              note={m.debt > 0 ? "em aberto" : undefined}
            />
            <Stat
              label="Taxa de poupança"
              value={pct(m.savingRate)}
              note={`${brl(answers.saving)} por mês`}
            />
            <Stat
              label="Reserva"
              value={brl(answers.reserve)}
              note={answers.reserve > 0 ? `cobre ${duration(m.reserveMonths)}` : "ainda não tem"}
            />
          </div>
        </Card>
      </section>

      <section className="print:break-before-page">
        <SectionTitle index="03">Pontos de atenção</SectionTitle>
        <AlertsSection report={report} />
      </section>

      <section className="print:break-before-page">
        <SectionTitle index="04">Distribuição e potencial de ajuste</SectionTitle>
        <DistributionSection diagnostic={diagnostic} />
      </section>

      <section className="print:break-before-page">
        <SectionTitle index="05">Projeção</SectionTitle>
        <ProjectionSection report={report} />
      </section>

      <section className="print:break-before-page">
        <SectionTitle index="06">Plano de 30 dias</SectionTitle>
        <PlanSection report={report} />
      </section>

      <footer className="border-t border-line pt-6 text-[13px] leading-relaxed text-muted print:break-inside-avoid">
        <p>{DISCLAIMER}</p>
        <p className="mt-2">
          Diagnóstico de {diagnostic.name} · {shortDate(diagnostic.createdAt)}
        </p>
      </footer>
    </article>
  );
}
