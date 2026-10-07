/**
 * Monta o relatório a partir das respostas: números do motor financeiro +
 * textos (pontos de atenção, plano de 30 dias, rota e alavancas). O mesmo
 * objeto alimenta o pré-diagnóstico, o relatório web e o PDF.
 */
import type {
  Alert,
  AlertType,
  Answers,
  Goal,
  Lever,
  Metrics,
  Milestone,
  PlanFocus,
  PlanWeek,
  PrimaryProblem,
  Profile,
  Report,
  Severity,
  Targets,
} from "@/types/diagnostic";
import {
  answersAfterPlan,
  applyScoreCaps,
  buildProjection,
  calculateFinancialMetrics,
  calculateFinancialScore,
  detectAlerts,
  detectPrimaryProblem,
  getProfile,
  nextReserveBand,
  nextSavingBand,
  reserveBase,
  scoreForAnswers,
  variableReductionTarget,
} from "@/lib/financial-engine";
import { BRAND } from "@/lib/brand";
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

/** Primeira ação prática para cada ponto de atenção. */
export const FIRST_STEP: Record<AlertType, string> = {
  DEFICIT: "Corte primeiro o que não é essencial até as contas fecharem no zero.",
  DEBT: "Liste as dívidas por valor e juros e evite assumir novas parcelas até negociar.",
  HIGH_COMMITMENT: "Revise os compromissos fixos: o que dá para renegociar ou cancelar?",
  INSTALLMENTS: "Deixe as parcelas atuais terminarem antes de assumir novas.",
  HIGH_VARIABLE: "Defina um teto semanal para delivery, lazer e compras pessoais.",
  LOW_SAVING: "Separe um valor fixo assim que o salário cair, antes de gastar.",
  LOW_RESERVE: "Abra uma conta só para imprevistos e mande para lá parte da sobra.",
};

const WEEKS_PER_MONTH = 4.3;
const round10 = (v: number) => Math.max(0, Math.round(v / 10) * 10);
const money = (v: number) => (v < 0 ? `−${brl(-v)}` : brl(v));
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function buildTargets(a: Answers, m: Metrics, reductionTarget: number): Targets {
  const free = Math.max(0, m.monthlyMargin + reductionTarget);
  const monthlyVariableCap = Math.max(0, a.variable - reductionTarget);
  const base = reserveBase(m);
  return {
    freeAfterPlan: free,
    monthlyVariableCap,
    weeklyVariableCap: round10(monthlyVariableCap / WEEKS_PER_MONTH),
    // O que já guarda, ou o que fica livre com o ajuste (arredondado para baixo), até 20% da renda.
    suggestedSaving: Math.max(a.saving, Math.floor(Math.min(free, m.income * 0.2) / 10) * 10),
    reserveBase: base,
    reserveTarget: base * 3,
    reserveIdeal: base * 6,
    debtPayoffMonths: m.debt > 0 ? (free > 0 ? Math.ceil(m.debt / free) : null) : 0,
  };
}

function buildAlert(type: AlertType, m: Metrics, a: Answers, t: Targets, cut: number): Alert {
  const severity = ALERT_SEVERITY[type];
  const base = { type, severity, firstStep: FIRST_STEP[type] };
  const committed = a.housing + a.essential + a.installments;
  switch (type) {
    case "DEFICIT":
      return {
        ...base,
        title: "Despesas acima da renda",
        figure: `Faltam ${brl(-m.monthlyMargin)} por mês`,
        text: PRIMARY_PROBLEM_TEXT.DEFICIT,
        analysis: `Seus gastos (${brl(m.totalExpenses)}) passam a renda (${brl(m.income)}) em ${brl(-m.monthlyMargin)} por mês. Em 12 meses, isso vira um buraco de ${brl(-m.monthlyMargin * 12)}, que costuma parar no cartão ou no cheque especial.`,
      };
    case "DEBT":
      return {
        ...base,
        title: "Dívidas vencidas",
        figure: `${brl(m.debt)} em aberto · ${times(m.debtRatio)} sua renda`,
        text: PRIMARY_PROBLEM_TEXT.DEBT,
        analysis:
          t.debtPayoffMonths
            ? `São ${brl(m.debt)} em atraso, ${times(m.debtRatio)} a sua renda. Com os ${brl(t.freeAfterPlan)} que sobram por mês depois do ajuste, daria para quitar em cerca de ${plural(t.debtPayoffMonths, "mês", "meses")}, sem contar juros e descontos.`
            : `São ${brl(m.debt)} em atraso, ${times(m.debtRatio)} a sua renda. Hoje não sobra dinheiro no mês para pagar: primeiro é preciso liberar margem, depois negociar.`,
      };
    case "HIGH_COMMITMENT":
      return {
        ...base,
        title: "Renda muito comprometida",
        figure: `${pct(m.commitmentRate)} da renda já tem destino fixo`,
        text: PRIMARY_PROBLEM_TEXT.HIGH_COMMITMENT,
        analysis: `${brl(committed)} saem antes do mês começar: moradia, contas essenciais e parcelas. A referência saudável é até 50% da renda (${brl(m.income * 0.5)}): você está ${brl(committed - m.income * 0.5)} acima.`,
      };
    case "INSTALLMENTS":
      return {
        ...base,
        title: "Parcelas pesando no mês",
        figure: `${brl(a.installments)} por mês · ${pct(m.installmentRate)} da renda`,
        text: PRIMARY_PROBLEM_TEXT.INSTALLMENTS,
        analysis: `Acima de 20% da renda (${brl(m.income * 0.2)}) as parcelas começam a apertar o mês: as suas passam ${brl(a.installments - m.income * 0.2)} disso. Cada parcela que termina devolve esse valor para a sua margem.`,
      };
    case "HIGH_VARIABLE":
      return {
        ...base,
        title: "Gastos não essenciais altos",
        figure: `${brl(a.variable)} por mês · ${pct(m.variableRate)} da renda`,
        text: "Os gastos não essenciais ocupam uma fatia grande da renda. É o caminho mais rápido para recuperar margem sem mexer nos compromissos fixos.",
        analysis: `A referência é até 30% da renda (${brl(m.income * 0.3)}); você está ${brl(a.variable - m.income * 0.3)} acima. Reduzir só 12% já libera ${brl(cut)} por mês, ou ${brl(cut * 12)} em um ano.`,
      };
    case "LOW_SAVING":
      return {
        ...base,
        title: "Pouco dinheiro guardado por mês",
        figure:
          a.saving > 0
            ? `Você guarda ${brl(a.saving)} por mês · ${pct(m.savingRate)} da renda`
            : "Hoje nada fica separado no mês",
        text: PRIMARY_PROBLEM_TEXT.LOW_SAVING,
        analysis:
          t.suggestedSaving > a.saving
            ? `A partir de 10% da renda (${brl(m.income * 0.1)}) a reserva cresce de forma consistente. Com o ajuste do plano, dá para guardar ${brl(t.suggestedSaving)} por mês: ${brl(t.suggestedSaving * 12)} em um ano.`
            : `A partir de 10% da renda (${brl(m.income * 0.1)}) a reserva cresce de forma consistente. Primeiro o mês precisa sobrar; o plano começa por aí.`,
      };
    case "LOW_RESERVE":
      return {
        ...base,
        title: "Reserva curta para imprevistos",
        figure:
          a.reserve > 0
            ? `Sua reserva cobre ${duration(m.reserveMonths)} dos gastos essenciais`
            : "Você ainda não tem reserva",
        text: PRIMARY_PROBLEM_TEXT.LOW_RESERVE,
        analysis: `Um mês de proteção são ${brl(t.reserveBase)} (moradia e contas essenciais); a referência é ter 3 meses, ${brl(t.reserveTarget)}. ${
          a.reserve > 0 ? `Hoje você tem ${brl(a.reserve)}.` : "Hoje você não tem nada guardado para isso."
        }`,
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

/** Linha do objetivo da pessoa no fim do plano de reserva. */
function goalStep(goal: Goal, m: Metrics, t: Targets): string {
  switch (goal) {
    case "debts":
      return "Mantenha a reserva como proteção: num imprevisto, ela evita recorrer a crédito caro.";
    case "surplus":
      return `Meta de longo prazo: sobrar 20% da renda, ${brl(m.income * 0.2)} por mês.`;
    case "reserve":
      return `Meta final: reserva de 6 meses, ${brl(t.reserveIdeal)}.`;
    case "purchase":
      return t.suggestedSaving > 0
        ? `Para a sua compra: com ${brl(t.suggestedSaving)} por mês, em 12 meses são ${brl(t.suggestedSaving * 12)}.`
        : "Para a sua compra: depois da reserva, o que sobrar vai para uma conta separada.";
    case "invest":
      return "Com a reserva de 3 meses completa, comece a estudar investimentos adequados ao seu perfil.";
    case "organize":
      return `Reserve 10 minutos por semana para conferir os gastos e refaça o seu ${BRAND.short} em 30 dias.`;
  }
}

export function buildPlan30D(
  focus: PlanFocus,
  a: Answers,
  m: Metrics,
  t: Targets,
  cut: number,
  alertTypes: AlertType[],
  goal: Goal,
): PlanWeek[] {
  const cap = t.weeklyVariableCap;
  const capLine =
    cap > 0
      ? `Teto semanal para não essenciais: ${brl(cap)}. Ao chegar nele, só o essencial até a semana virar.`
      : "Você não informou gastos não essenciais: o foco fica nas contas fixas.";
  const cutLine =
    cut > 0
      ? `Meta do mês: ${brl(cut)} a menos em não essenciais, de ${brl(a.variable)} para ${brl(a.variable - cut)}.`
      : "Procure sobras nas contas de consumo: luz, água, gás e celular.";
  const capTarget = (fallback: string) => (cap > 0 ? `Fechar a semana dentro do teto de ${brl(cap)}.` : fallback);
  const after = m.monthlyMargin + cut;
  const fixed = a.housing + a.essential;
  const committed = fixed + a.installments;

  switch (focus) {
    case "DEFICIT": {
      const rest = m.income - committed;
      return [
        {
          week: 1,
          title: "Estancar o vazamento",
          goal: "Suspenda novos parcelamentos e identifique despesas que podem ser eliminadas imediatamente.",
          actions: [
            a.installments > 0
              ? `Segure novas compras parceladas até o mês fechar no zero: as parcelas já levam ${brl(a.installments)} por mês.`
              : "Segure novas compras parceladas até o mês fechar no zero.",
            `Separe o extrato do último mês e marque cada gasto não essencial (você informou ${brl(a.variable)}).`,
            "Escolha pelo menos 3 gastos para cortar já: assinaturas, delivery e compras por impulso costumam ser os primeiros.",
          ],
          target: cap > 0 ? `Gastar no máximo ${brl(cap)} em não essenciais nesta semana.` : "Lista de gastos marcada até o fim da semana.",
        },
        {
          week: 2,
          title: "Cortar o que pesa",
          goal: "Reduza gastos variáveis conforme a meta calculada pelo sistema.",
          actions: [cutLine, capLine, "Cancele ou pause pelo menos uma assinatura ou serviço que você usa pouco."],
          target: capTarget("Uma conta reduzida ou cancelada."),
        },
        {
          week: 3,
          title: "Renegociar o fixo",
          goal: "Revise despesas recorrentes e priorize apenas gastos essenciais.",
          actions: [
            `Moradia e contas essenciais somam ${brl(fixed)} (${pct(fixed / m.income)} da renda). Peça redução em pelo menos 2 contas: internet, celular, seguros ou planos.`,
            after < 0
              ? `Mesmo com o corte sugerido ainda faltam ${brl(-after)} por mês. Defina de onde virá: corte nos essenciais, venda de algo parado ou uma renda extra.`
              : `Com o corte sugerido o mês passa a fechar com ${brl(after)}. Guarde esse valor antes que vire gasto novo.`,
            "Evite cobrir o mês com cheque especial ou rotativo do cartão: são os créditos mais caros do mercado.",
          ],
          target: "Duas contas renegociadas ou canceladas.",
        },
        {
          week: 4,
          title: "Fechar no azul",
          goal: "Defina um teto de gastos que mantenha seu próximo mês dentro da renda disponível.",
          actions: [
            `Teto do próximo mês: até ${brl(m.income)} no total.`,
            rest > 0
              ? `Divisão sugerida: moradia ${brl(a.housing)}, essenciais ${brl(a.essential)}, parcelas ${brl(a.installments)} e até ${brl(rest)} para todo o resto.`
              : `Só moradia, essenciais e parcelas já somam ${brl(committed)}, acima da renda: renegociar esses valores vem antes de tudo.`,
            `Anote o resultado do mês e compare com este ${BRAND.short}.`,
          ],
          target: "Fechar o mês com resultado igual ou maior que zero.",
        },
      ];
    }
    case "DEBT":
      return [
        {
          week: 1,
          title: "Colocar as dívidas no papel",
          goal: "Liste suas dívidas por valor e prioridade.",
          actions: [
            `Liste cada dívida com credor, valor, juros ao mês e dias de atraso. O total informado é ${brl(m.debt)}, ${times(m.debtRatio)} a sua renda.`,
            "Coloque no topo as de juros mais altos, como rotativo do cartão e cheque especial.",
            "Consulte as dívidas no seu nome no Registrato, do Banco Central, para não esquecer nenhuma.",
          ],
          target: "Lista completa, da dívida mais cara para a mais barata.",
        },
        {
          week: 2,
          title: "Parar de crescer",
          goal: "Evite criar novos parcelamentos enquanto existir saldo vencido.",
          actions: [
            "Segure novas compras parceladas e empréstimos até ter a negociação em mãos.",
            cut > 0 ? `${capLine} Isso libera ${brl(cut)} no mês.` : capLine,
            a.installments > 0
              ? `Suas parcelas atuais somam ${brl(a.installments)} por mês: anote quando cada uma termina.`
              : "Tire o cartão de crédito dos aplicativos de compra por enquanto.",
          ],
          target: "Nenhuma compra parcelada nova nesta semana.",
        },
        {
          week: 3,
          title: "Negociar",
          goal: "Direcione parte da margem recuperada para a dívida prioritária.",
          actions: [
            "Procure o credor da dívida prioritária e peça propostas à vista e parcelada.",
            t.freeAfterPlan > 0
              ? `Só aceite parcela que caiba em ${brl(t.freeAfterPlan)} por mês, o que sobra com o ajuste.`
              : "Hoje não sobra dinheiro no mês: negocie prazo e só aceite parcela depois de liberar margem.",
            "Peça a proposta por escrito e confira o valor total antes de aceitar.",
          ],
          target: "Uma proposta concreta para a dívida prioritária.",
        },
        {
          week: 4,
          title: "Pagar e recalcular",
          goal: "Recalcule o saldo e estabeleça a próxima meta de pagamento.",
          actions: [
            t.freeAfterPlan > 0
              ? `Separe ${brl(t.freeAfterPlan)} assim que receber e pague a dívida prioritária.`
              : "Assim que sobrar dinheiro, direcione tudo para a dívida prioritária.",
            t.debtPayoffMonths
              ? `Nesse ritmo, os ${brl(m.debt)} acabam em cerca de ${plural(t.debtPayoffMonths, "mês", "meses")}, sem contar juros e descontos da negociação.`
              : "O prazo de quitação sai da negociação: anote a data da última parcela.",
            "Atualize a lista com os novos saldos e marque a próxima dívida da fila.",
          ],
          target: "Primeiro pagamento feito e lista atualizada.",
        },
      ];
    case "COMMITMENT": {
      const above = committed - m.income * 0.5;
      const limit = m.income * 0.7;
      return [
        {
          week: 1,
          title: "Mapear os compromissos",
          goal: "Identifique quais compromissos fixos podem ser renegociados ou eliminados.",
          actions: [
            above > 0
              ? `${brl(committed)} saem antes do mês começar (${pct(m.commitmentRate)} da renda), ${brl(above)} acima da referência de 50%.`
              : `${brl(committed)} saem antes do mês começar (${pct(m.commitmentRate)} da renda).`,
            `Liste moradia (${brl(a.housing)}), contas essenciais (${brl(a.essential)}) e cada parcela (total de ${brl(a.installments)}).`,
            "Marque o que dá para renegociar, trocar por uma opção mais barata ou cancelar.",
          ],
          target: "Lista com pelo menos 3 compromissos para renegociar.",
        },
        {
          week: 2,
          title: "Travar compromissos novos",
          goal: "Evite assumir novos pagamentos recorrentes.",
          actions: [
            "Segure novas parcelas, assinaturas e financiamentos neste mês.",
            a.installments > 0
              ? `Suas parcelas somam ${brl(a.installments)} (${pct(m.installmentRate)} da renda). Anote o mês em que cada uma termina: é margem que volta para você.`
              : "Revise os débitos automáticos e cancele o que você não usa.",
            "Renegocie pelo menos uma conta fixa: internet, celular, seguro ou plano.",
          ],
          target: "Nenhum compromisso novo e uma conta renegociada.",
        },
        {
          week: 3,
          title: "Recuperar margem",
          goal: "Reduza gastos variáveis para recuperar margem.",
          actions: [capLine, cutLine, "Transfira o que economizar para outra conta no mesmo dia, para não virar gasto."],
          target: capTarget("Uma sobra encontrada e separada."),
        },
        {
          week: 4,
          title: "Definir o seu limite",
          goal: "Defina um limite máximo de comprometimento para os próximos meses.",
          actions: [
            committed > limit
              ? `Limite sugerido para compromissos fixos: até 70% da renda, ${brl(limit)} por mês. Hoje você está ${brl(committed - limit)} acima.`
              : `Limite sugerido para compromissos fixos: até 70% da renda, ${brl(limit)} por mês.`,
            "Qualquer compromisso novo só entra se couber nesse limite.",
            t.freeAfterPlan > 0
              ? `Com o ajuste, sobram ${brl(t.freeAfterPlan)} por mês: comece a reserva com ${brl(t.suggestedSaving)}.`
              : "Quando a margem aparecer, comece a reserva com o que sobrar.",
          ],
          target: "Limite definido e primeira transferência para a reserva.",
        },
      ];
    }
    case "SAVING": {
      const sav = t.suggestedSaving;
      const months3 = sav > 0 ? Math.ceil(Math.max(0, t.reserveTarget - a.reserve) / sav) : null;
      return [
        {
          week: 1,
          title: "Pague-se primeiro",
          goal: "Defina um valor mínimo para separar assim que receber.",
          actions: [
            sav > 0
              ? a.saving > 0
                ? `Valor sugerido: ${brl(sav)} por mês, separado no dia em que o salário cair (hoje você guarda ${brl(a.saving)}).`
                : `Valor sugerido: ${brl(sav)} por mês, separado no dia em que o salário cair.`
              : "Comece com qualquer valor, mesmo pequeno, separado no dia em que o salário cair.",
            "Programe uma transferência automática para esse dia.",
            "Use uma conta separada, só para a reserva, longe do cartão e do Pix do dia a dia.",
          ],
          target: sav > 0 ? `Primeira transferência de ${brl(sav)} feita.` : "Primeira transferência feita.",
        },
        {
          week: 2,
          title: "Proteger o valor",
          goal: "Trate esse valor como compromisso fixo.",
          actions: [
            capLine,
            "Trate o valor guardado como uma conta fixa: ele sai primeiro, não no fim do mês.",
            alertTypes.includes("INSTALLMENTS")
              ? `Segure novas parcelas: as atuais já levam ${brl(a.installments)} por mês.`
              : alertTypes.includes("HIGH_VARIABLE")
                ? `Os não essenciais estão em ${pct(m.variableRate)} da renda: o teto acima é o que mais ajuda.`
                : "Revise as assinaturas e cancele as que você não usa há um mês.",
          ],
          target: capTarget("Valor guardado intocado."),
        },
        {
          week: 3,
          title: "Fazer a reserva crescer",
          goal: "Direcione parte da economia obtida para sua reserva.",
          actions: [
            a.reserve < t.reserveBase
              ? `Primeiro degrau: 1 mês de gastos essenciais, ${brl(t.reserveBase)}. Você tem ${brl(a.reserve)}.`
              : a.reserve < t.reserveTarget
                ? `Você já tem ${duration(m.reserveMonths)} de reserva. Próximo degrau: 3 meses, ${brl(t.reserveTarget)}.`
                : `Sua reserva já cobre ${duration(m.reserveMonths)}: a referência de 3 meses (${brl(t.reserveTarget)}) está garantida.`,
            a.reserve < t.reserveTarget
              ? months3
                ? `Com ${brl(sav)} por mês, os 3 meses (${brl(t.reserveTarget)}) chegam em cerca de ${plural(months3, "mês", "meses")}.`
                : "Assim que houver sobra, ela vai primeiro para a reserva."
              : `Daqui em diante, o que você guarda pode ir para o seu objetivo: ${GOAL_LABEL[goal].toLowerCase()}.`,
            "Dinheiro extra, como 13º, restituição e bônus, vai primeiro para a reserva até completar.",
          ],
          target: "Reserva maior que no início do mês.",
        },
        {
          week: 4,
          title: "Fechar e subir a meta",
          goal: "Feche o mês mantendo o valor separado e defina a meta do mês seguinte.",
          actions: [
            "Confira se o valor separado ficou intocado até o fim do mês.",
            "Se o mês fechou com sobra, suba a meta do próximo mês um degrau, por exemplo mais R$ 50.",
            goalStep(goal, m, t),
          ],
          target: "Mês fechado com o valor guardado.",
        },
      ];
    }
  }
}

function horizonLabel(months: number): string {
  if (months <= 1) return "Próximos 30 dias";
  if (months <= 60) return `Em cerca de ${months} meses`;
  return "Em mais de 5 anos, no ritmo de hoje";
}

const DESTINATION: Record<Goal, string> = {
  debts: "Vida sem dívidas em atraso",
  surplus: "Sobrar 20% da renda todo mês",
  reserve: "Reserva ideal: 6 meses",
  purchase: "A sua compra",
  invest: "Começar a investir",
  organize: "Mês sob controle",
};

/** Rota em etapas: o que fazer agora, o que vem depois e o destino. */
export function buildRoute(focus: PlanFocus, a: Answers, m: Metrics, t: Targets, cut: number, goal: Goal): Milestone[] {
  const after = m.monthlyMargin + cut;
  const sav = t.suggestedSaving;
  const route: Milestone[] = [];

  const now: Record<PlanFocus, [string, string]> = {
    DEFICIT: [
      "Fechar o mês sem déficit",
      after >= 0
        ? `O corte de ${brl(cut)} cobre o déficit de ${brl(-m.monthlyMargin)} e deixa ${brl(after)} livres.`
        : `O corte de ${brl(cut)} reduz o déficit de ${brl(-m.monthlyMargin)} para ${brl(-after)}.`,
    ],
    DEBT: [
      "Organizar e negociar as dívidas",
      t.freeAfterPlan > 0
        ? `${brl(m.debt)} em atraso. Meta: uma proposta que caiba em ${brl(t.freeAfterPlan)} por mês.`
        : `${brl(m.debt)} em atraso. Meta: negociar prazo até o mês voltar a sobrar.`,
    ],
    COMMITMENT: [
      "Recuperar margem",
      `Liberar ${brl(cut)} por mês nos não essenciais: a sobra vai de ${money(m.monthlyMargin)} para ${money(after)}.`,
    ],
    SAVING: [
      "Guardar todo mês",
      sav > 0
        ? `Separar ${brl(sav)} assim que o salário cair, numa conta só para isso.`
        : "Separar qualquer valor assim que o salário cair, numa conta só para isso.",
    ],
  };
  route.push({ key: "now", horizon: "Próximos 30 dias", title: now[focus][0], detail: now[focus][1] });

  let elapsed = 1;
  let blocked = false;
  if (after < 0) {
    blocked = true;
    route.push({
      key: "deficit",
      horizon: "Logo em seguida",
      title: "Zerar o que ainda falta",
      detail: `Faltam ${brl(-after)} por mês além do ajuste: vêm de cortes nos essenciais ou de uma renda extra.`,
    });
  }
  if (m.debt > 0) {
    const n = t.debtPayoffMonths;
    route.push({
      key: "debt",
      horizon: n ? horizonLabel(elapsed + n) : "Depois de liberar margem",
      title: "Quitar as dívidas vencidas",
      detail: n
        ? `${brl(m.debt)} com ${brl(t.freeAfterPlan)} por mês, sem contar juros e descontos.`
        : `${brl(m.debt)}: o prazo sai da negociação, assim que o mês voltar a sobrar.`,
    });
    if (n) elapsed += n;
    else blocked = true;
  }
  const reserveStep = (key: string, title: string, amount: number) => {
    const n = !blocked && sav > 0 ? Math.ceil(Math.max(0, amount - a.reserve) / sav) : null;
    route.push({
      key,
      horizon: n ? horizonLabel(elapsed + n) : "Depois das etapas anteriores",
      title,
      detail:
        sav > 0
          ? `${brl(amount)} guardados (hoje: ${brl(a.reserve)}), com ${brl(sav)} por mês.`
          : `${brl(amount)} guardados (hoje: ${brl(a.reserve)}).`,
    });
    return n;
  };
  let lastReserve: number | null = 0;
  if (a.reserve < t.reserveBase) lastReserve = reserveStep("reserve1", "Primeiro degrau da reserva: 1 mês", t.reserveBase);
  if (a.reserve < t.reserveTarget) lastReserve = reserveStep("reserve3", "Reserva completa: 3 meses", t.reserveTarget);
  if (lastReserve) elapsed += lastReserve;

  const destinationDetail: Record<Goal, string> = {
    debts:
      m.debt > 0
        ? "Com as dívidas quitadas, a reserva passa a proteger você de crédito caro."
        : "Você já não tem dívidas vencidas: a reserva mantém você longe delas.",
    surplus: `${brl(m.income * 0.2)} livres por mês (hoje: ${money(m.monthlyMargin)}).`,
    reserve: `${brl(t.reserveIdeal)} guardados para imprevistos.`,
    purchase:
      sav > 0
        ? `Depois da reserva, ${brl(sav)} por mês somam ${brl(sav * 12)} em um ano.`
        : "Depois da reserva, o que sobrar vai para uma conta separada para a sua compra.",
    invest: "Com a reserva completa, o que sobra pode ir para investimentos adequados ao seu perfil.",
    organize: `Revisão semanal de 10 minutos e o ${BRAND.short} refeito a cada 30 dias.`,
  };
  route.push({
    key: "goal",
    horizon: blocked ? "Seu destino" : `Seu destino · a partir do mês ${elapsed + 1}`,
    title: DESTINATION[goal],
    detail: destinationDetail[goal],
  });
  return route;
}

/** O que mais move o mês, do maior para o menor efeito. */
export function buildLevers(a: Answers, m: Metrics, cut: number): Lever[] {
  const levers: [string, number][] = [
    ["Cortar 12% dos não essenciais", cut],
    ["Renegociar 10% das contas essenciais", a.essential * 0.1],
    ["Quando as parcelas atuais terminarem", a.installments],
  ];
  return levers
    .filter(([, v]) => v > 0)
    .map(([label, monthly]) => ({ label, monthly, marginAfter: m.monthlyMargin + monthly }))
    .sort((x, y) => y.monthly - x.monthly);
}

/** Explica por que o score não muda só com o ajuste do mês e o que faria ele subir. */
export function outlookHint(a: Answers, m: Metrics, t: Targets, cut: number, scoreNow: number, scoreAfter: number): string | null {
  if (scoreAfter > scoreNow) return null;
  if (m.monthlyMargin + cut < 0) {
    return "Seu score só começa a subir quando o mês deixar de fechar no negativo. É a primeira etapa da sua rota.";
  }
  const after = answersAfterPlan(a);
  const steps: string[] = [];
  const saving = nextSavingBand(after.saving / m.income);
  if (saving) steps.push(`guardar ${brl(Math.ceil((saving * m.income) / 10) * 10)} por mês (${pct(saving).replace(",0", "")} da renda)`);
  const reserve = nextReserveBand(m.reserveMonths);
  if (reserve && t.reserveBase > 0) steps.push(`chegar a ${brl(reserve * t.reserveBase)} de reserva`);
  if (steps.length === 0) return `O ajuste deste mês mantém seu score em ${scoreNow}: o próximo salto vem da rota.`;
  return `Só o ajuste deste mês ainda não muda a faixa do seu score. Ele sobe quando você ${steps.join(" ou ")}.`;
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
    throw new Error(`Respostas incompletas para gerar o ${BRAND.name}.`);
  }
  const metrics = calculateFinancialMetrics(answers);
  const scoreBreakdown = calculateFinancialScore(metrics);
  const rawScore = Object.values(scoreBreakdown).reduce((sum, v) => sum + v, 0);
  const score = applyScoreCaps(rawScore, metrics);
  const primaryProblem = detectPrimaryProblem(metrics);
  const reductionTarget = variableReductionTarget(answers.variable);
  const projection = buildProjection(metrics, reductionTarget);
  const planFocus = planFocusFor(primaryProblem);
  const targets = buildTargets(answers, metrics, reductionTarget);
  const alertTypes = detectAlerts(metrics);
  const scoreAfter = Math.max(score, scoreForAnswers(answersAfterPlan(answers)));

  return {
    version: 2,
    score,
    profile: getProfile(score),
    scoreBreakdown,
    metrics,
    primaryProblem,
    alerts: alertTypes.map((type) => buildAlert(type, metrics, answers, targets, reductionTarget)),
    adjustment: { variable: answers.variable, reductionTarget },
    projection,
    planFocus,
    plan30d: buildPlan30D(planFocus, answers, metrics, targets, reductionTarget, alertTypes, answers.goal),
    targets,
    route: buildRoute(planFocus, answers, metrics, targets, reductionTarget, answers.goal),
    levers: buildLevers(answers, metrics, reductionTarget),
    outlook: {
      scoreNow: score,
      scoreAfter,
      profileAfter: getProfile(scoreAfter),
      hint: outlookHint(answers, metrics, targets, reductionTarget, score, scoreAfter),
    },
    goal: answers.goal,
  };
}
