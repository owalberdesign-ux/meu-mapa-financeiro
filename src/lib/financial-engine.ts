/**
 * Motor financeiro do Meu Mapa Financeiro: todas as fórmulas e regras de pontuação ficam aqui
 * (briefing, seções 16 a 25 e 33 a 34). Componentes só leem o resultado.
 */
import type {
  AlertType,
  Answers,
  Metrics,
  PrimaryProblem,
  Profile,
  Projection,
  ScoreBreakdown,
} from "@/types/diagnostic";

/** Divisão protegida: denominador zero vira 0, nunca NaN/Infinity. */
function ratio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

export function calculateFinancialMetrics(a: Answers): Metrics {
  const debt = a.hasDebt ? a.debt : 0;
  const fixedExpenses = a.housing + a.essential;
  const totalExpenses = a.housing + a.essential + a.variable + a.installments;
  const monthlyMargin = a.income - totalExpenses;

  return {
    income: a.income,
    debt,
    fixedExpenses,
    totalExpenses,
    monthlyMargin,
    marginRate: ratio(monthlyMargin, a.income),
    commitmentRate: ratio(a.housing + a.essential + a.installments, a.income),
    installmentRate: ratio(a.installments, a.income),
    variableRate: ratio(a.variable, a.income),
    savingRate: ratio(a.saving, a.income),
    // Sem gastos fixos informados, a reserva é medida contra o total de gastos.
    reserveMonths: ratio(a.reserve, fixedExpenses || totalExpenses),
    debtRatio: ratio(debt, a.income),
  };
}

export function scoreFlow(marginRate: number): number {
  if (marginRate >= 0.2) return 30;
  if (marginRate >= 0.1) return 25;
  if (marginRate >= 0.05) return 18;
  if (marginRate >= 0) return 10;
  return 0;
}

export function scoreDebt(debt: number, debtRatio: number): number {
  if (debt <= 0) return 25;
  if (debtRatio <= 0.5) return 18;
  if (debtRatio <= 1) return 12;
  if (debtRatio <= 2) return 6;
  return 0;
}

export function scoreCommitment(commitmentRate: number): number {
  if (commitmentRate <= 0.5) return 20;
  if (commitmentRate <= 0.6) return 16;
  if (commitmentRate <= 0.7) return 10;
  if (commitmentRate <= 0.8) return 5;
  return 0;
}

export function scoreSaving(savingRate: number): number {
  if (savingRate >= 0.2) return 15;
  if (savingRate >= 0.1) return 12;
  if (savingRate >= 0.05) return 7;
  if (savingRate >= 0.01) return 3;
  return 0;
}

export function scoreReserve(reserveMonths: number): number {
  if (reserveMonths >= 6) return 10;
  if (reserveMonths >= 3) return 8;
  if (reserveMonths >= 1) return 5;
  if (reserveMonths >= 0.5) return 2;
  return 0;
}

export function calculateFinancialScore(m: Metrics): ScoreBreakdown {
  return {
    flow: scoreFlow(m.marginRate),
    debt: scoreDebt(m.debt, m.debtRatio),
    commitment: scoreCommitment(m.commitmentRate),
    saving: scoreSaving(m.savingRate),
    reserve: scoreReserve(m.reserveMonths),
  };
}

export function applyScoreCaps(rawScore: number, m: Metrics): number {
  let score = rawScore;
  if (m.monthlyMargin < 0) score = Math.min(score, 49);
  if (m.monthlyMargin < 0 && m.debt > 0) score = Math.min(score, 29);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getProfile(score: number): Profile {
  if (score <= 29) return "NO_VERMELHO";
  if (score <= 49) return "NO_LIMITE";
  if (score <= 69) return "EM_AJUSTE";
  if (score <= 84) return "EM_EQUILIBRIO";
  return "EM_CONSTRUCAO";
}

/**
 * Condições de cada ponto de atenção, na ordem de prioridade do briefing.
 * HIGH_VARIABLE não tem limite definido no briefing: usamos gastos não
 * essenciais acima de 30% da renda.
 */
const ALERT_RULES: [AlertType, (m: Metrics) => boolean][] = [
  ["DEFICIT", (m) => m.monthlyMargin < 0],
  ["DEBT", (m) => m.debt > 0],
  ["HIGH_COMMITMENT", (m) => m.commitmentRate > 0.7],
  ["INSTALLMENTS", (m) => m.installmentRate > 0.2],
  ["HIGH_VARIABLE", (m) => m.variableRate > 0.3],
  ["LOW_SAVING", (m) => m.savingRate < 0.05],
  ["LOW_RESERVE", (m) => m.reserveMonths < 1],
];

/** Problema principal: a primeira condição verdadeira (HIGH_VARIABLE não concorre). */
export function detectPrimaryProblem(m: Metrics): PrimaryProblem {
  for (const [type, applies] of ALERT_RULES) {
    if (type !== "HIGH_VARIABLE" && applies(m)) return type;
  }
  return "NONE";
}

/** Até 3 pontos de atenção, os mais relevantes primeiro. */
export function detectAlerts(m: Metrics): AlertType[] {
  return ALERT_RULES.filter(([, applies]) => applies(m))
    .map(([type]) => type)
    .slice(0, 3);
}

/** Redução conservadora de 12% dos gastos não essenciais. */
export function variableReductionTarget(variable: number): number {
  return variable * 0.12;
}

export function buildProjection(m: Metrics, reductionTarget: number): Projection {
  const monthlyPotential = Math.max(0, m.monthlyMargin) + reductionTarget;
  return {
    monthlyPotential,
    threeMonths: monthlyPotential * 3,
    sixMonths: monthlyPotential * 6,
    twelveMonths: monthlyPotential * 12,
  };
}

/** Base da reserva: gastos essenciais do mês (ou o total, se não houver). */
export function reserveBase(m: Metrics): number {
  return m.fixedExpenses || m.totalExpenses;
}

/**
 * Respostas simuladas ao fim do plano: 12% a menos nos não essenciais e o que
 * esse corte deixar livre indo para a poupança. Dívida e reserva não mudam.
 */
export function answersAfterPlan(a: Answers): Answers {
  const m = calculateFinancialMetrics(a);
  const cut = variableReductionTarget(a.variable);
  const freed = Math.max(0, Math.min(cut, m.monthlyMargin + cut));
  return { ...a, variable: a.variable - cut, saving: a.saving + freed };
}

export function scoreForAnswers(a: Answers): number {
  const m = calculateFinancialMetrics(a);
  const points = Object.values(calculateFinancialScore(m)).reduce((s, v) => s + v, 0);
  return applyScoreCaps(points, m);
}

/** Próximo limite de faixa da poupança acima da taxa atual (seção 21). */
export function nextSavingBand(savingRate: number): number | null {
  return [0.01, 0.05, 0.1, 0.2].find((t) => savingRate < t) ?? null;
}

/** Próximo limite de faixa da reserva, em meses, acima do atual (seção 22). */
export function nextReserveBand(reserveMonths: number): number | null {
  return [0.5, 1, 3, 6].find((t) => reserveMonths < t) ?? null;
}
