/**
 * Leituras derivadas do relatório para o PDF: pilares do score, indicadores
 * com estado, distribuição da renda e cenários de projeção. Tudo sai das
 * mesmas regras do motor financeiro; nada de fórmula nova nos componentes.
 */
import type { AlertType, Answers, Report, ScoreBreakdown } from "@/types/diagnostic";
import {
  scoreCommitment,
  scoreDebt,
  scoreFlow,
  scoreReserve,
  scoreSaving,
} from "@/lib/financial-engine";
import { brl, duration, pct, times } from "@/lib/format";

export type Status = "good" | "attention" | "risk";

export const STATUS_LABEL: Record<Status, string> = {
  good: "Saudável",
  attention: "Atenção",
  risk: "Risco",
};

export const SCORE_MAX: ScoreBreakdown = {
  flow: 30,
  debt: 25,
  commitment: 20,
  saving: 15,
  reserve: 10,
};

const PILLAR_LABEL: Record<keyof ScoreBreakdown, string> = {
  flow: "Fluxo mensal",
  debt: "Dívidas",
  commitment: "Comprometimento",
  saving: "Poupança",
  reserve: "Reserva",
};

export interface ScorePillar {
  key: keyof ScoreBreakdown;
  label: string;
  points: number;
  max: number;
}

export function scorePillars(report: Report): ScorePillar[] {
  return (Object.keys(SCORE_MAX) as (keyof ScoreBreakdown)[]).map((key) => ({
    key,
    label: PILLAR_LABEL[key],
    points: report.scoreBreakdown[key],
    max: SCORE_MAX[key],
  }));
}

/** Explica quando o déficit limitou o score (briefing, seção 23). */
export function scoreCapNote(report: Report): string | null {
  const raw = Object.values(report.scoreBreakdown).reduce((s, v) => s + v, 0);
  if (raw <= report.score) return null;
  return report.metrics.debt > 0
    ? `Seus pontos somam ${raw}, mas com déficit e dívida vencida o score fica limitado a 29.`
    : `Seus pontos somam ${raw}, mas com déficit no mês o score fica limitado a 49.`;
}

/**
 * Estado pela fração dos pontos possíveis daquele pilar: 70% ou mais é
 * saudável, zero ponto é risco. Poupança e reserva baixas pedem atenção, mas
 * não são risco real, então param em "attention".
 */
function statusFromPoints(points: number, max: number, canBeRisk = true): Status {
  const share = points / max;
  if (share >= 0.7) return "good";
  if (share > 0 || !canBeRisk) return "attention";
  return "risk";
}

export interface Indicator {
  key: string;
  label: string;
  value: string;
  detail: string;
  /** Posição no medidor, de 0 a 1. */
  fill: number;
  /** Onde fica a referência no medidor, de 0 a 1. */
  target: number;
  reference: string;
  status: Status;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function buildIndicators(report: Report, answers: Answers): Indicator[] {
  const m = report.metrics;
  const debtPoints = scoreDebt(m.debt, m.debtRatio);
  return [
    {
      key: "margin",
      label: "Sobra no mês",
      value: m.monthlyMargin < 0 ? `−${brl(-m.monthlyMargin)}` : brl(m.monthlyMargin),
      detail: `${pct(m.marginRate)} da renda`,
      fill: clamp(m.marginRate / 0.3),
      target: 0.2 / 0.3,
      reference: "Saudável a partir de 10% · ideal 20%",
      status: statusFromPoints(scoreFlow(m.marginRate), SCORE_MAX.flow),
    },
    {
      key: "commitment",
      label: "Renda comprometida",
      value: pct(m.commitmentRate),
      detail: "moradia, essenciais e parcelas",
      fill: clamp(m.commitmentRate),
      target: 0.5,
      reference: "Saudável até 60% · ideal até 50%",
      status: statusFromPoints(scoreCommitment(m.commitmentRate), SCORE_MAX.commitment),
    },
    {
      key: "installments",
      label: "Peso das parcelas",
      value: pct(m.installmentRate),
      detail: `${brl(answers.installments)} por mês`,
      fill: clamp(m.installmentRate / 0.4),
      target: 0.2 / 0.4,
      reference: "Atenção acima de 20%",
      status: m.installmentRate > 0.2 ? "attention" : "good",
    },
    {
      key: "variable",
      label: "Gastos não essenciais",
      value: pct(m.variableRate),
      detail: `${brl(answers.variable)} por mês`,
      fill: clamp(m.variableRate / 0.5),
      target: 0.3 / 0.5,
      reference: "Atenção acima de 30%",
      status: m.variableRate > 0.3 ? "attention" : "good",
    },
    {
      key: "saving",
      label: "Taxa de poupança",
      value: pct(m.savingRate),
      detail: `${brl(answers.saving)} por mês`,
      fill: clamp(m.savingRate / 0.3),
      target: 0.2 / 0.3,
      reference: "Saudável a partir de 10% · ideal 20%",
      status: statusFromPoints(scoreSaving(m.savingRate), SCORE_MAX.saving, false),
    },
    {
      key: "reserve",
      label: "Reserva para imprevistos",
      value: answers.reserve > 0 ? duration(m.reserveMonths) : "Nenhuma",
      detail: `${brl(answers.reserve)} guardados`,
      fill: clamp(m.reserveMonths / 6),
      target: 3 / 6,
      reference: "Ideal: de 3 a 6 meses de gastos essenciais",
      status: statusFromPoints(scoreReserve(m.reserveMonths), SCORE_MAX.reserve, false),
    },
    {
      key: "debt",
      label: "Dívidas vencidas",
      value: m.debt > 0 ? brl(m.debt) : "Nenhuma",
      detail: m.debt > 0 ? `${times(m.debtRatio)} sua renda` : "nada em atraso",
      fill: clamp(m.debtRatio / 2),
      target: 0.5 / 2,
      reference: "Atenção acima de meia renda",
      status: m.debt <= 0 ? "good" : debtPoints >= 18 ? "attention" : "risk",
    },
  ];
}

export interface Slice {
  key: string;
  label: string;
  value: number;
  /** Fração do total do gráfico (renda, ou total de gastos quando há déficit). */
  share: number;
  /** Fração da renda, para o texto. */
  ofIncome: number;
}

/** Fatias da renda; em déficit o total do gráfico vira o total de gastos. */
export function incomeSlices(report: Report, answers: Answers): { slices: Slice[]; deficit: boolean } {
  const m = report.metrics;
  const deficit = m.monthlyMargin < 0;
  const base = deficit ? m.totalExpenses : m.income;
  const items: [string, string, number][] = [
    ["housing", "Moradia", answers.housing],
    ["essential", "Despesas essenciais", answers.essential],
    ["installments", "Parcelas", answers.installments],
    ["variable", "Não essenciais", answers.variable],
  ];
  if (!deficit) items.push(["margin", "Sobra", m.monthlyMargin]);
  const slices = items.map(([key, label, value]) => ({
    key,
    label,
    value,
    share: base > 0 ? value / base : 0,
    ofIncome: m.income > 0 ? value / m.income : 0,
  }));
  return { slices, deficit };
}

export interface Scenario {
  months: number;
  current: number;
  adjusted: number;
}

/**
 * Acumulado em 3, 6 e 12 meses: mantendo o mês como está e com o ajuste
 * sugerido. Sem déficit, "adjusted" é a mesma projeção do briefing (seção 34).
 */
export function projectionScenarios(report: Report): Scenario[] {
  const margin = report.metrics.monthlyMargin;
  const withAdjustment = margin + report.adjustment.reductionTarget;
  return [3, 6, 12].map((months) => ({
    months,
    current: margin * months,
    adjusted: withAdjustment * months,
  }));
}

/** Primeiro passo prático para cada ponto de atenção. */
export const FIRST_STEP: Record<AlertType, string> = {
  DEFICIT: "Corte primeiro o que não é essencial até as contas fecharem no zero.",
  DEBT: "Liste as dívidas por valor e prioridade e evite assumir novas parcelas.",
  HIGH_COMMITMENT: "Revise os compromissos fixos: o que dá para renegociar ou cancelar?",
  INSTALLMENTS: "Deixe as parcelas atuais terminarem antes de assumir novas.",
  HIGH_VARIABLE: "Defina um teto mensal para delivery, lazer e compras pessoais.",
  LOW_SAVING: "Separe um valor fixo assim que o salário cair, antes de gastar.",
  LOW_RESERVE: "Direcione parte da sobra para uma conta só de imprevistos.",
};

/** Resumo em uma frase com os números da pessoa. */
export function summarySentence(report: Report): string {
  const m = report.metrics;
  const flow =
    m.monthlyMargin < 0
      ? `faltam ${brl(-m.monthlyMargin)} por mês`
      : `sobram ${brl(m.monthlyMargin)} (${pct(m.marginRate)})`;
  return `Você recebe ${brl(m.income)}, gasta ${brl(m.totalExpenses)} e ${flow}. ${pct(
    m.commitmentRate,
  )} da renda já tem destino antes do mês começar.`;
}
