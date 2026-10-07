import { describe, expect, it } from "vitest";
import type { Answers } from "@/types/diagnostic";
import {
  applyScoreCaps,
  calculateFinancialMetrics,
  getProfile,
  scoreCommitment,
  scoreDebt,
  scoreFlow,
  scoreReserve,
  scoreSaving,
} from "@/lib/financial-engine";
import { buildReport, isCompleteAnswers } from "@/lib/report-builder";
import { SAMPLE_DIAGNOSTIC } from "@/lib/sample";

const base: Answers = {
  income: 4500,
  housing: 1200,
  essential: 1100,
  variable: 900,
  installments: 650,
  hasDebt: true,
  debt: 1200,
  saving: 100,
  reserve: 800,
  goal: "surplus",
};

describe("métricas", () => {
  it("calcula as fórmulas da seção 16 com o objeto de exemplo do briefing", () => {
    const m = calculateFinancialMetrics(base);
    expect(m.fixedExpenses).toBe(2300);
    expect(m.totalExpenses).toBe(3850);
    expect(m.monthlyMargin).toBe(650);
    expect(m.commitmentRate).toBeCloseTo(2950 / 4500);
    expect(m.installmentRate).toBeCloseTo(650 / 4500);
    expect(m.savingRate).toBeCloseTo(100 / 4500);
    expect(m.reserveMonths).toBeCloseTo(800 / 2300);
    expect(m.debtRatio).toBeCloseTo(1200 / 4500);
  });

  it("ignora o valor de dívida quando a pessoa responde que não tem", () => {
    const m = calculateFinancialMetrics({ ...base, hasDebt: false, debt: 5000 });
    expect(m.debt).toBe(0);
    expect(m.debtRatio).toBe(0);
  });

  it("não gera NaN nem Infinity com denominadores zerados", () => {
    const m = calculateFinancialMetrics({
      ...base,
      income: 0,
      housing: 0,
      essential: 0,
      variable: 0,
      installments: 0,
    });
    for (const value of Object.values(m)) expect(Number.isFinite(value)).toBe(true);
  });
});

describe("faixas de pontuação", () => {
  it("fluxo mensal", () => {
    expect(scoreFlow(0.2)).toBe(30);
    expect(scoreFlow(0.1999)).toBe(25);
    expect(scoreFlow(0.1)).toBe(25);
    expect(scoreFlow(0.05)).toBe(18);
    expect(scoreFlow(0)).toBe(10);
    expect(scoreFlow(-0.01)).toBe(0);
  });

  it("dívidas", () => {
    expect(scoreDebt(0, 0)).toBe(25);
    expect(scoreDebt(100, 0.5)).toBe(18);
    expect(scoreDebt(100, 0.51)).toBe(12);
    expect(scoreDebt(100, 1)).toBe(12);
    expect(scoreDebt(100, 2)).toBe(6);
    expect(scoreDebt(100, 2.01)).toBe(0);
  });

  it("comprometimento", () => {
    expect(scoreCommitment(0.5)).toBe(20);
    expect(scoreCommitment(0.6)).toBe(16);
    expect(scoreCommitment(0.7)).toBe(10);
    expect(scoreCommitment(0.8)).toBe(5);
    expect(scoreCommitment(0.81)).toBe(0);
  });

  it("poupança", () => {
    expect(scoreSaving(0.2)).toBe(15);
    expect(scoreSaving(0.1)).toBe(12);
    expect(scoreSaving(0.05)).toBe(7);
    expect(scoreSaving(0.01)).toBe(3);
    expect(scoreSaving(0.009)).toBe(0);
  });

  it("reserva", () => {
    expect(scoreReserve(6)).toBe(10);
    expect(scoreReserve(3)).toBe(8);
    expect(scoreReserve(1)).toBe(5);
    expect(scoreReserve(0.5)).toBe(2);
    expect(scoreReserve(0.49)).toBe(0);
  });
});

describe("limites do score", () => {
  const deficit = calculateFinancialMetrics({ ...base, variable: 2000, hasDebt: false, debt: 0 });
  const deficitWithDebt = calculateFinancialMetrics({ ...base, variable: 2000 });

  it("déficit limita a 49", () => {
    expect(deficit.monthlyMargin).toBeLessThan(0);
    expect(applyScoreCaps(80, deficit)).toBe(49);
  });

  it("déficit com dívida vencida limita a 29", () => {
    expect(applyScoreCaps(80, deficitWithDebt)).toBe(29);
  });

  it("arredonda e mantém entre 0 e 100", () => {
    const ok = calculateFinancialMetrics(base);
    expect(applyScoreCaps(47.6, ok)).toBe(48);
    expect(applyScoreCaps(130, ok)).toBe(100);
    expect(applyScoreCaps(-5, ok)).toBe(0);
  });
});

describe("perfis", () => {
  it("segue as faixas da seção 24", () => {
    expect(getProfile(0)).toBe("NO_VERMELHO");
    expect(getProfile(29)).toBe("NO_VERMELHO");
    expect(getProfile(30)).toBe("NO_LIMITE");
    expect(getProfile(49)).toBe("NO_LIMITE");
    expect(getProfile(50)).toBe("EM_AJUSTE");
    expect(getProfile(69)).toBe("EM_AJUSTE");
    expect(getProfile(70)).toBe("EM_EQUILIBRIO");
    expect(getProfile(84)).toBe("EM_EQUILIBRIO");
    expect(getProfile(85)).toBe("EM_CONSTRUCAO");
    expect(getProfile(100)).toBe("EM_CONSTRUCAO");
  });
});

describe("relatório", () => {
  it("objeto de exemplo do briefing: 25 + 18 + 10 + 3 + 0 = 56, problema principal dívida", () => {
    const r = buildReport(base);
    expect(r.scoreBreakdown).toEqual({ flow: 25, debt: 18, commitment: 10, saving: 3, reserve: 0 });
    expect(r.score).toBe(56);
    expect(r.profile).toBe("EM_AJUSTE");
    expect(r.primaryProblem).toBe("DEBT");
    expect(r.alerts.map((a) => a.type)).toEqual(["DEBT", "LOW_SAVING", "LOW_RESERVE"]);
    expect(r.planFocus).toBe("DEBT");
  });

  it("potencial de ajuste e projeção (seções 33 e 34)", () => {
    const r = buildReport(base);
    expect(r.adjustment.reductionTarget).toBeCloseTo(108);
    expect(r.projection.monthlyPotential).toBeCloseTo(758);
    expect(r.projection.threeMonths).toBeCloseTo(2274);
    expect(r.projection.sixMonths).toBeCloseTo(4548);
    expect(r.projection.twelveMonths).toBeCloseTo(9096);
  });

  it("em déficit, a projeção conta só a redução sugerida", () => {
    const r = buildReport({ ...base, variable: 2000 });
    expect(r.primaryProblem).toBe("DEFICIT");
    expect(r.score).toBeLessThanOrEqual(29);
    expect(r.projection.monthlyPotential).toBeCloseTo(240);
    expect(r.planFocus).toBe("DEFICIT");
  });

  it("parcelas altas usam o plano de recuperar margem", () => {
    const r = buildReport({
      ...base,
      hasDebt: false,
      debt: 0,
      housing: 800,
      essential: 900,
      installments: 1000,
      variable: 300,
    });
    expect(r.primaryProblem).toBe("INSTALLMENTS");
    expect(r.planFocus).toBe("COMMITMENT");
  });

  it("sem nenhum problema: NONE, sem pontos de atenção e plano de reserva", () => {
    const r = buildReport({
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
    });
    expect(r.primaryProblem).toBe("NONE");
    expect(r.alerts).toHaveLength(0);
    expect(r.score).toBe(100);
    expect(r.profile).toBe("EM_CONSTRUCAO");
    expect(r.planFocus).toBe("SAVING");
  });

  it("mostra no máximo 3 pontos de atenção, na ordem de prioridade", () => {
    const r = buildReport({
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
    });
    expect(r.alerts.map((a) => a.type)).toEqual(["DEFICIT", "DEBT", "HIGH_COMMITMENT"]);
    expect(r.alerts.map((a) => a.severity)).toEqual(["risk", "risk", "attention"]);
  });

  it("recusa renda zero e dívida marcada sem valor", () => {
    expect(isCompleteAnswers({ ...base, income: 0 })).toBe(false);
    expect(isCompleteAnswers({ ...base, debt: 0 })).toBe(false);
    expect(() => buildReport({ ...base, income: 0 })).toThrow();
  });

  it("exemplo do hero: 40 pontos, no limite, recuperar margem", () => {
    const r = SAMPLE_DIAGNOSTIC.report;
    expect(r.score).toBe(40);
    expect(r.profile).toBe("NO_LIMITE");
    expect(r.primaryProblem).toBe("HIGH_COMMITMENT");
  });

  it("o relatório é serializável em JSON sem perda (report_data)", () => {
    const r = buildReport(base);
    expect(JSON.parse(JSON.stringify(r))).toEqual(r);
  });
});
