/**
 * Monta o relatório a partir das respostas: números do motor financeiro +
 * textos (pontos de atenção e plano de 30 dias). O mesmo objeto alimenta o
 * pré-diagnóstico, o relatório web e o PDF.
 */
import type {
  Alert,
  AlertType,
  Answers,
  Goal,
  Metrics,
  PlanFocus,
  PlanWeek,
  PrimaryProblem,
  Profile,
  Report,
  Severity,
} from "@/types/diagnostic";
import {
  applyScoreCaps,
  buildProjection,
  calculateFinancialMetrics,
  calculateFinancialScore,
  detectAlerts,
  detectPrimaryProblem,
  getProfile,
  variableReductionTarget,
} from "@/lib/financial-engine";
import { brl, duration, pct, times } from "@/lib/format";

export const PROFILE_LABEL: Record<Profile, string> = {
  NO_VERMELHO: "No vermelho",
  NO_LIMITE: "No limite",
  EM_AJUSTE: "Em ajuste",
  EM_EQUILIBRIO: "Em equilíbrio",
  EM_CONSTRUCAO: "Em construção",
};

/** Estado visual do perfil: risco real, atenção ou avanço. */
export const PROFILE_TONE: Record<Profile, "risk" | "attention" | "good"> = {
  NO_VERMELHO: "risk",
  NO_LIMITE: "attention",
  EM_AJUSTE: "attention",
  EM_EQUILIBRIO: "good",
  EM_CONSTRUCAO: "good",
};

export const GOAL_LABEL: Record<Goal, string> = {
  debts: "Sair das dívidas",
  surplus: "Fazer o dinheiro sobrar",
  reserve: "Montar uma reserva",
  purchase: "Comprar alguma coisa",
  invest: "Começar a investir",
  organize: "Me organizar melhor",
};

export const PRIMARY_PROBLEM_TEXT: Record<PrimaryProblem, string> = {
  DEFICIT:
    "Hoje suas despesas ultrapassam sua renda. Sua primeira prioridade é interromper esse déficit mensal.",
  DEBT: "Você possui dívidas vencidas que estão pressionando sua organização financeira. Sua prioridade deve ser estabilizar o mês e reduzir esse passivo.",
  HIGH_COMMITMENT:
    "Uma parcela alta da sua renda já está comprometida antes mesmo do mês começar.",
  INSTALLMENTS:
    "Uma parte relevante da sua renda está sendo consumida por compras feitas nos meses anteriores.",
  LOW_SAVING:
    "Você consegue sustentar seus gastos, mas ainda transforma pouco da renda em segurança financeira.",
  LOW_RESERVE:
    "Sua estrutura financeira funciona, mas ainda está vulnerável a imprevistos.",
  NONE: "Seus números estão equilibrados. Sua prioridade agora é manter a constância e fazer a reserva crescer mês a mês.",
};

/** Rótulo curto da prioridade (pré-diagnóstico e capa). */
export const PRIORITY_LABEL: Record<PrimaryProblem, string> = {
  DEFICIT: "Interromper o déficit",
  DEBT: "Estabilizar as dívidas",
  HIGH_COMMITMENT: "Recuperar margem",
  INSTALLMENTS: "Aliviar as parcelas",
  LOW_SAVING: "Começar a guardar",
  LOW_RESERVE: "Montar a reserva",
  NONE: "Fazer a reserva crescer",
};

const ALERT_SEVERITY: Record<AlertType, Severity> = {
  DEFICIT: "risk",
  DEBT: "risk",
  HIGH_COMMITMENT: "attention",
  INSTALLMENTS: "attention",
  HIGH_VARIABLE: "attention",
  LOW_SAVING: "attention",
  LOW_RESERVE: "attention",
};

function buildAlert(type: AlertType, m: Metrics, a: Answers): Alert {
  const severity = ALERT_SEVERITY[type];
  switch (type) {
    case "DEFICIT":
      return {
        type,
        severity,
        title: "Despesas acima da renda",
        figure: `Faltam ${brl(-m.monthlyMargin)} por mês`,
        text: PRIMARY_PROBLEM_TEXT.DEFICIT,
      };
    case "DEBT":
      return {
        type,
        severity,
        title: "Dívidas vencidas",
        figure: `${brl(m.debt)} em aberto · ${times(m.debtRatio)} sua renda`,
        text: PRIMARY_PROBLEM_TEXT.DEBT,
      };
    case "HIGH_COMMITMENT":
      return {
        type,
        severity,
        title: "Renda muito comprometida",
        figure: `${pct(m.commitmentRate)} da renda já tem destino fixo`,
        text: PRIMARY_PROBLEM_TEXT.HIGH_COMMITMENT,
      };
    case "INSTALLMENTS":
      return {
        type,
        severity,
        title: "Parcelas pesando no mês",
        figure: `${brl(a.installments)} por mês · ${pct(m.installmentRate)} da renda`,
        text: PRIMARY_PROBLEM_TEXT.INSTALLMENTS,
      };
    case "HIGH_VARIABLE":
      return {
        type,
        severity,
        title: "Gastos não essenciais altos",
        figure: `${brl(a.variable)} por mês · ${pct(m.variableRate)} da renda`,
        text: "Os gastos não essenciais ocupam uma fatia grande da renda. É o caminho mais rápido para recuperar margem sem mexer nos compromissos fixos.",
      };
    case "LOW_SAVING":
      return {
        type,
        severity,
        title: "Pouco dinheiro guardado por mês",
        figure:
          a.saving > 0
            ? `Você guarda ${brl(a.saving)} por mês · ${pct(m.savingRate)} da renda`
            : "Hoje nada fica separado no mês",
        text: PRIMARY_PROBLEM_TEXT.LOW_SAVING,
      };
    case "LOW_RESERVE":
      return {
        type,
        severity,
        title: "Reserva curta para imprevistos",
        figure:
          a.reserve > 0
            ? `Sua reserva cobre ${duration(m.reserveMonths)} dos gastos essenciais`
            : "Você ainda não tem reserva",
        text: PRIMARY_PROBLEM_TEXT.LOW_RESERVE,
      };
  }
}

export function planFocusFor(problem: PrimaryProblem): PlanFocus {
  switch (problem) {
    case "DEFICIT":
      return "DEFICIT";
    case "DEBT":
      return "DEBT";
    case "HIGH_COMMITMENT":
    case "INSTALLMENTS":
      return "COMMITMENT";
    default:
      return "SAVING";
  }
}

export const PLAN_TITLE: Record<PlanFocus, string> = {
  DEFICIT: "Plano para sair do déficit",
  DEBT: "Plano para estabilizar as dívidas",
  COMMITMENT: "Plano para recuperar margem",
  SAVING: "Plano para guardar e montar reserva",
};

export function buildPlan30D(
  focus: PlanFocus,
  m: Metrics,
  reductionTarget: number,
  monthlyPotential: number,
): PlanWeek[] {
  const target = brl(reductionTarget);
  switch (focus) {
    case "DEFICIT":
      return [
        {
          week: 1,
          text: "Suspenda novos parcelamentos e identifique despesas que podem ser eliminadas imediatamente.",
        },
        {
          week: 2,
          text: "Reduza gastos variáveis conforme a meta calculada pelo sistema.",
          detail: `Sua meta: ${target} a menos por mês em gastos não essenciais.`,
        },
        {
          week: 3,
          text: "Revise despesas recorrentes e priorize apenas gastos essenciais.",
        },
        {
          week: 4,
          text: "Defina um teto de gastos que mantenha seu próximo mês dentro da renda disponível.",
          detail: `Seu teto: até ${brl(m.income)} em despesas no mês.`,
        },
      ];
    case "DEBT":
      return [
        {
          week: 1,
          text: "Liste suas dívidas por valor e prioridade.",
          detail: `Hoje: ${brl(m.debt)} em dívidas vencidas.`,
        },
        {
          week: 2,
          text: "Evite criar novos parcelamentos enquanto existir saldo vencido.",
        },
        {
          week: 3,
          text: "Direcione parte da margem recuperada para a dívida prioritária.",
          detail: `Com o ajuste sugerido, sua margem pode chegar a ${brl(monthlyPotential)} por mês.`,
        },
        {
          week: 4,
          text: "Recalcule o saldo e estabeleça a próxima meta de pagamento.",
        },
      ];
    case "COMMITMENT":
      return [
        {
          week: 1,
          text: "Identifique quais compromissos fixos podem ser renegociados ou eliminados.",
          detail: `Hoje ${pct(m.commitmentRate)} da renda já está comprometida.`,
        },
        { week: 2, text: "Evite assumir novos pagamentos recorrentes." },
        {
          week: 3,
          text: "Reduza gastos variáveis para recuperar margem.",
          detail: `Sua meta: ${target} a menos por mês em gastos não essenciais.`,
        },
        {
          week: 4,
          text: "Defina um limite máximo de comprometimento para os próximos meses.",
          detail: `Uma referência: até 70% da renda, ou ${brl(m.income * 0.7)} por mês.`,
        },
      ];
    case "SAVING":
      return [
        {
          week: 1,
          text: "Defina um valor mínimo para separar assim que receber.",
          detail: `Um ponto de partida: os ${target} da redução sugerida nos gastos não essenciais.`,
        },
        { week: 2, text: "Trate esse valor como compromisso fixo." },
        { week: 3, text: "Direcione parte da economia obtida para sua reserva." },
        {
          week: 4,
          text: "Feche o mês mantendo o valor separado e defina a meta do mês seguinte.",
        },
      ];
  }
}

/** Valida o que o motor precisa; o quiz já impede esses casos na digitação. */
export function isCompleteAnswers(a: Answers): boolean {
  const amounts = [a.income, a.housing, a.essential, a.variable, a.installments, a.debt, a.saving, a.reserve];
  if (amounts.some((v) => !Number.isFinite(v) || v < 0)) return false;
  if (a.income <= 0) return false;
  if (a.hasDebt && a.debt <= 0) return false;
  return a.goal in GOAL_LABEL;
}

export function buildReport(answers: Answers): Report {
  if (!isCompleteAnswers(answers)) {
    throw new Error("Respostas incompletas para gerar o Raio-X.");
  }
  const metrics = calculateFinancialMetrics(answers);
  const scoreBreakdown = calculateFinancialScore(metrics);
  const rawScore = Object.values(scoreBreakdown).reduce((sum, v) => sum + v, 0);
  const score = applyScoreCaps(rawScore, metrics);
  const primaryProblem = detectPrimaryProblem(metrics);
  const reductionTarget = variableReductionTarget(answers.variable);
  const projection = buildProjection(metrics, reductionTarget);
  const planFocus = planFocusFor(primaryProblem);

  return {
    version: 1,
    score,
    profile: getProfile(score),
    scoreBreakdown,
    metrics,
    primaryProblem,
    alerts: detectAlerts(metrics).map((type) => buildAlert(type, metrics, answers)),
    adjustment: { variable: answers.variable, reductionTarget },
    projection,
    planFocus,
    plan30d: buildPlan30D(planFocus, metrics, reductionTarget, projection.monthlyPotential),
    goal: answers.goal,
  };
}
