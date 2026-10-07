export type Goal =
  | "debts"
  | "surplus"
  | "reserve"
  | "purchase"
  | "invest"
  | "organize";

/** Respostas do quiz, em reais inteiros por mês (debt e reserve são saldos). */
export interface Answers {
  income: number;
  housing: number;
  essential: number;
  variable: number;
  installments: number;
  hasDebt: boolean;
  debt: number;
  saving: number;
  reserve: number;
  goal: Goal;
}

export type Profile =
  | "NO_VERMELHO"
  | "NO_LIMITE"
  | "EM_AJUSTE"
  | "EM_EQUILIBRIO"
  | "EM_CONSTRUCAO";

export type AlertType =
  | "DEFICIT"
  | "DEBT"
  | "HIGH_COMMITMENT"
  | "INSTALLMENTS"
  | "HIGH_VARIABLE"
  | "LOW_SAVING"
  | "LOW_RESERVE";

/** NONE: nenhuma das seis condições do briefing se aplica. */
export type PrimaryProblem = Exclude<AlertType, "HIGH_VARIABLE"> | "NONE";

/** risk = risco real (vermelho); attention = atenção (âmbar). */
export type Severity = "risk" | "attention";

export type PlanFocus = "DEFICIT" | "DEBT" | "COMMITMENT" | "SAVING";

export interface Metrics {
  income: number;
  debt: number;
  fixedExpenses: number;
  totalExpenses: number;
  monthlyMargin: number;
  marginRate: number;
  commitmentRate: number;
  installmentRate: number;
  variableRate: number;
  savingRate: number;
  reserveMonths: number;
  debtRatio: number;
}

export interface ScoreBreakdown {
  flow: number;
  debt: number;
  commitment: number;
  saving: number;
  reserve: number;
}

export interface Alert {
  type: AlertType;
  severity: Severity;
  title: string;
  figure: string;
  text: string;
  /** Leitura com os números da pessoa: distância da referência e impacto em reais. */
  analysis: string;
  /** Primeira ação prática. */
  firstStep: string;
}

export interface Adjustment {
  variable: number;
  reductionTarget: number;
}

export interface Projection {
  monthlyPotential: number;
  threeMonths: number;
  sixMonths: number;
  twelveMonths: number;
}

export interface PlanWeek {
  week: number;
  title: string;
  /** Objetivo da semana (texto-base do briefing, seções 36 a 39). */
  goal: string;
  /** Ações concretas, com os valores da pessoa. */
  actions: string[];
  /** Meta mensurável para conferir no fim da semana. */
  target: string;
}

/** Valores de referência calculados para o plano e a rota. */
export interface Targets {
  /** Dinheiro que fica livre por mês depois do ajuste sugerido (nunca negativo). */
  freeAfterPlan: number;
  weeklyVariableCap: number;
  monthlyVariableCap: number;
  suggestedSaving: number;
  /** Base da reserva: gastos essenciais do mês (moradia + essenciais). */
  reserveBase: number;
  reserveTarget: number;
  reserveIdeal: number;
  debtPayoffMonths: number | null;
}

export interface Milestone {
  key: string;
  horizon: string;
  title: string;
  detail: string;
}

export interface Lever {
  label: string;
  monthly: number;
  marginAfter: number;
}

export interface Outlook {
  scoreNow: number;
  scoreAfter: number;
  profileAfter: Profile;
  /** Quando o plano sozinho não muda o score: o que falta para subir de faixa. */
  hint: string | null;
}

export interface Report {
  version: 2;
  score: number;
  profile: Profile;
  scoreBreakdown: ScoreBreakdown;
  metrics: Metrics;
  primaryProblem: PrimaryProblem;
  alerts: Alert[];
  adjustment: Adjustment;
  projection: Projection;
  planFocus: PlanFocus;
  plan30d: PlanWeek[];
  targets: Targets;
  route: Milestone[];
  levers: Lever[];
  outlook: Outlook;
  goal: Goal;
}

export type PaymentStatus = "pending" | "paid" | "refunded";

/** Espelha a tabela `diagnostics` (supabase/schema.sql). */
export interface Diagnostic {
  id: string;
  name: string;
  email: string;
  answers: Answers;
  report: Report;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  createdAt: string;
  paidAt: string | null;
}
