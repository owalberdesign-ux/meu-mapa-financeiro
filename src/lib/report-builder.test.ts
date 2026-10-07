import { describe, expect, it } from "vitest";
import type { Answers } from "@/types/diagnostic";
import { buildReport } from "@/lib/report-builder";
import { SAMPLE_ANSWERS } from "@/lib/sample";

const deficitWithDebt: Answers = {
  income: 3000,
  housing: 1500,
  essential: 900,
  variable: 1000,
  installments: 700,
  hasDebt: true,
  debt: 4000,
  saving: 0,
  reserve: 0,
  goal: "debts",
};

const debtOnly: Answers = {
  income: 5000,
  housing: 1300,
  essential: 1200,
  variable: 900,
  installments: 300,
  hasDebt: true,
  debt: 6000,
  saving: 200,
  reserve: 500,
  goal: "debts",
};

const healthy: Answers = {
  income: 10000,
  housing: 2000,
  essential: 1500,
  variable: 1500,
  installments: 0,
  hasDebt: false,
  debt: 0,
  saving: 2500,
  reserve: 30000,
  goal: "invest",
};

describe("metas calculadas", () => {
  it("exemplo: teto semanal, valor a guardar e reserva", () => {
    const t = buildReport(SAMPLE_ANSWERS).targets;
    // não essenciais 650, corte 78 → 572 por mês → ~133 por semana → 130
    expect(t.monthlyVariableCap).toBeCloseTo(572);
    expect(t.weeklyVariableCap).toBe(130);
    // livre depois do ajuste: 150 + 78 = 228 → sugerido 220 (arredonda para baixo)
    expect(t.freeAfterPlan).toBeCloseTo(228);
    expect(t.suggestedSaving).toBe(220);
    expect(t.reserveBase).toBe(3100);
    expect(t.reserveTarget).toBe(9300);
    expect(t.debtPayoffMonths).toBe(0);
  });

  it("valor sugerido nunca passa de 20% da renda e não fica abaixo do que já guarda", () => {
    const t = buildReport(healthy).targets;
    expect(t.suggestedSaving).toBe(2500);
  });

  it("prazo da dívida usa o que fica livre depois do ajuste", () => {
    const r = buildReport(debtOnly);
    // margem 1300 + corte 108 = 1408 livres → 6000 / 1408 → 5 meses
    expect(r.targets.freeAfterPlan).toBeCloseTo(1408);
    expect(r.targets.debtPayoffMonths).toBe(5);
  });

  it("em déficit que o ajuste não cobre, não há prazo de dívida", () => {
    const r = buildReport(deficitWithDebt);
    expect(r.targets.freeAfterPlan).toBe(0);
    expect(r.targets.debtPayoffMonths).toBeNull();
  });
});

describe("plano de 30 dias", () => {
  const cases: [string, Answers][] = [
    ["comprometimento", SAMPLE_ANSWERS],
    ["déficit", deficitWithDebt],
    ["dívida", debtOnly],
    ["saudável", healthy],
  ];

  it.each(cases)("%s: 4 semanas, cada uma com título, objetivo, 3 ações e meta", (_, answers) => {
    const plan = buildReport(answers).plan30d;
    expect(plan.map((w) => w.week)).toEqual([1, 2, 3, 4]);
    for (const w of plan) {
      expect(w.title.length).toBeGreaterThan(3);
      expect(w.goal.length).toBeGreaterThan(10);
      expect(w.actions).toHaveLength(3);
      expect(w.target.length).toBeGreaterThan(5);
      for (const a of w.actions) expect(a).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it("usa os números da pessoa nas ações", () => {
    const text = buildReport(SAMPLE_ANSWERS).plan30d.flatMap((w) => [...w.actions, w.target]).join(" ");
    expect(text).toContain("R$ 130"); // teto semanal
    expect(text).toContain("R$ 78"); // corte do mês
    expect(text).toContain("R$ 3.150"); // limite de 70% da renda
  });

  it("dívida: inclui o prazo estimado de quitação", () => {
    const text = buildReport(debtOnly).plan30d.flatMap((w) => w.actions).join(" ");
    expect(text).toContain("cerca de 5 meses");
  });

  it("déficit que o ajuste não cobre: diz quanto ainda falta", () => {
    const text = buildReport(deficitWithDebt).plan30d.flatMap((w) => w.actions).join(" ");
    expect(text).toContain("ainda faltam R$ 980");
  });
});

describe("rota", () => {
  it("exemplo sem dívida: agora → reserva de 1 mês → 3 meses → destino", () => {
    const route = buildReport(SAMPLE_ANSWERS).route;
    expect(route.map((m) => m.key)).toEqual(["now", "reserve1", "reserve3", "goal"]);
    // reserva 1.800 → 3.100: 1.300 / 220 = 6 meses (+1 do plano) → 7
    expect(route[1].horizon).toBe("Em cerca de 7 meses");
    // 9.300 - 1.800 = 7.500 / 220 = 35 meses (+1) → 36
    expect(route[2].horizon).toBe("Em cerca de 36 meses");
    expect(route[3].title).toBe("Sobrar 20% da renda todo mês");
  });

  it("dívida vem antes da reserva", () => {
    const route = buildReport(debtOnly).route;
    expect(route.map((m) => m.key)).toEqual(["now", "debt", "reserve1", "reserve3", "goal"]);
    expect(route[1].horizon).toBe("Em cerca de 6 meses");
  });

  it("déficit não coberto bloqueia os prazos seguintes", () => {
    const route = buildReport(deficitWithDebt).route;
    expect(route.map((m) => m.key)).toEqual(["now", "deficit", "debt", "reserve1", "reserve3", "goal"]);
    expect(route.slice(2).every((m) => !m.horizon.startsWith("Em cerca"))).toBe(true);
  });

  it("saudável com reserva cheia vai direto ao destino", () => {
    const route = buildReport(healthy).route;
    expect(route.map((m) => m.key)).toEqual(["now", "goal"]);
    expect(route[1].title).toBe("Começar a investir");
  });
});

describe("pontos de atenção, alavancas e score possível", () => {
  it("cada ponto de atenção traz análise em números e primeiro passo", () => {
    const r = buildReport(SAMPLE_ANSWERS);
    for (const a of r.alerts) {
      expect(a.analysis).toMatch(/R\$/);
      expect(a.firstStep.length).toBeGreaterThan(10);
    }
    expect(r.alerts[0].analysis).toContain("R$ 1.450 acima");
  });

  it("alavancas em ordem do maior para o menor efeito", () => {
    const levers = buildReport(SAMPLE_ANSWERS).levers;
    expect(levers.map((l) => l.label)).toEqual([
      "Quando as parcelas atuais terminarem",
      "Renegociar 10% das contas essenciais",
      "Cortar 12% dos não essenciais",
    ]);
    expect(levers[0].marginAfter).toBe(750);
  });

  it("quando o ajuste não muda o score, explica o que falta (sem falar em déficit para quem não tem)", () => {
    const briefing: Answers = { ...debtOnly, income: 4500, housing: 1200, essential: 1100, variable: 900, installments: 650, debt: 1200, saving: 100, reserve: 800, goal: "surplus" };
    const r = buildReport(briefing);
    expect(r.outlook.scoreAfter).toBe(r.score);
    expect(r.outlook.hint).not.toContain("negativo");
    expect(r.outlook.hint).toContain("R$\u00a0230 por mês"); // 5% de 4.500 = 225 → 230
    expect(r.outlook.hint).toContain("R$\u00a01.150 de reserva"); // meio mês de 2.300
    expect(buildReport(deficitWithDebt).outlook.hint).toContain("negativo");
    expect(buildReport(SAMPLE_ANSWERS).outlook.hint).toBeNull();
  });

  it("score possível depois do plano nunca é menor que o de hoje", () => {
    for (const answers of [SAMPLE_ANSWERS, deficitWithDebt, debtOnly, healthy]) {
      const { outlook, score } = buildReport(answers);
      expect(outlook.scoreNow).toBe(score);
      expect(outlook.scoreAfter).toBeGreaterThanOrEqual(score);
    }
    // exemplo: margem e poupança sobem com o corte guardado
    expect(buildReport(SAMPLE_ANSWERS).outlook.scoreAfter).toBeGreaterThan(40);
  });
});
