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
  text: string;
  detail?: string;
}

export interface Report {
  version: 1;
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
  goal: Goal;
}

export type PaymentStatus = "pending" | "paid";

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
