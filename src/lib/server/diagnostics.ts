/**
 * Regras do servidor para diagnósticos: validar o que chega do quiz e não entregar o conteúdo
 * pago antes da confirmação do pagamento.
 */
import type { Answers, Diagnostic, Goal, Report } from "@/types/diagnostic";
import { GOAL_LABEL, isCompleteAnswers } from "@/lib/report-builder";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_AMOUNT = 100_000_000;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function amount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= MAX_AMOUNT
    ? Math.round(value)
    : null;
}

export function parseLead(body: unknown): { name: string; email: string; answers: Answers } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase().slice(0, 254) : "";
  if (name.length < 2 || !EMAIL_RE.test(email)) return null;

  const a = (b.answers ?? {}) as Record<string, unknown>;
  const keys = ["income", "housing", "essential", "variable", "installments", "debt", "saving", "reserve"] as const;
  const values = Object.fromEntries(keys.map((k) => [k, amount(a[k])])) as Record<(typeof keys)[number], number | null>;
  if (keys.some((k) => values[k] === null)) return null;
  if (typeof a.hasDebt !== "boolean" || typeof a.goal !== "string" || !(a.goal in GOAL_LABEL)) return null;

  const answers: Answers = {
    income: values.income!,
    housing: values.housing!,
    essential: values.essential!,
    variable: values.variable!,
    installments: values.installments!,
    hasDebt: a.hasDebt,
    debt: a.hasDebt ? values.debt! : 0,
    saving: values.saving!,
    reserve: values.reserve!,
    goal: a.goal as Goal,
  };
  return isCompleteAnswers(answers) ? { name, email, answers } : null;
}

/**
 * Antes do pagamento a tela só precisa do pré-diagnóstico (score, perfil, números-chave,
 * prioridade e quantos pontos de atenção existem). O resto do relatório não sai do servidor.
 */
function lockReport(report: Report): Report {
  return {
    ...report,
    alerts: report.alerts.map((a) => ({ ...a, title: "", figure: "", text: "", analysis: "", firstStep: "" })),
    adjustment: { variable: 0, reductionTarget: 0 },
    projection: { monthlyPotential: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
    plan30d: [],
    targets: {
      freeAfterPlan: 0,
      weeklyVariableCap: 0,
      monthlyVariableCap: 0,
      suggestedSaving: 0,
      reserveBase: 0,
      reserveTarget: 0,
      reserveIdeal: 0,
      debtPayoffMonths: null,
    },
    route: [],
    levers: [],
    outlook: { scoreNow: report.score, scoreAfter: report.score, profileAfter: report.profile, hint: null },
  };
}

export function forClient(diagnostic: Diagnostic): Diagnostic {
  return diagnostic.paymentStatus === "paid" ? diagnostic : { ...diagnostic, report: lockReport(diagnostic.report) };
}
