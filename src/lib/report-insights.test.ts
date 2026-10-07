import { describe, expect, it } from "vitest";
import type { Answers } from "@/types/diagnostic";
import { buildReport } from "@/lib/report-builder";
import {
  buildIndicators,
  incomeSlices,
  projectionScenarios,
  scoreCapNote,
  scorePillars,
  summarySentence,
} from "@/lib/report-insights";
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

describe("pilares do score", () => {
  it("somam os pontos do relatório e respeitam o máximo de cada pilar", () => {
    const r = buildReport(SAMPLE_ANSWERS);
    const pillars = scorePillars(r);
    expect(pillars.map((p) => p.max)).toEqual([30, 25, 20, 15, 10]);
    expect(pillars.reduce((s, p) => s + p.points, 0)).toBe(r.score);
    expect(scoreCapNote(r)).toBeNull();
  });

  it("explica o limite quando há déficit e dívida", () => {
    const r = buildReport({ ...deficitWithDebt, saving: 600, reserve: 20000 });
    expect(r.score).toBe(29);
    expect(scoreCapNote(r)).toContain("limitado a 29");
  });
});

describe("indicadores", () => {
  it("exemplo: comprometimento acima de 80% é risco; poupança e reserva baixas pedem atenção", () => {
    const r = buildReport(SAMPLE_ANSWERS);
    const byKey = Object.fromEntries(buildIndicators(r, SAMPLE_ANSWERS).map((i) => [i.key, i]));
    expect(byKey.commitment.status).toBe("risk");
    expect(byKey.margin.status).toBe("attention");
    expect(byKey.saving.status).toBe("attention");
    expect(byKey.reserve.status).toBe("attention");
    expect(byKey.debt.status).toBe("good");
    expect(byKey.debt.value).toBe("Nenhuma");
  });

  it("déficit e dívida acima de meia renda são risco", () => {
    const r = buildReport(deficitWithDebt);
    const byKey = Object.fromEntries(buildIndicators(r, deficitWithDebt).map((i) => [i.key, i]));
    expect(byKey.margin.status).toBe("risk");
    expect(byKey.margin.value.startsWith("−")).toBe(true);
    expect(byKey.debt.status).toBe("risk");
    expect(byKey.installments.status).toBe("attention");
  });

  it("perfil saudável fica todo verde e os medidores ficam entre 0 e 1", () => {
    const r = buildReport(healthy);
    const indicators = buildIndicators(r, healthy);
    expect(indicators.every((i) => i.status === "good")).toBe(true);
    for (const i of buildIndicators(buildReport(deficitWithDebt), deficitWithDebt).concat(indicators)) {
      expect(i.fill).toBeGreaterThanOrEqual(0);
      expect(i.fill).toBeLessThanOrEqual(1);
    }
  });
});

describe("distribuição da renda", () => {
  it("sem déficit, as fatias somam 100% da renda e incluem a sobra", () => {
    const r = buildReport(SAMPLE_ANSWERS);
    const { slices, deficit } = incomeSlices(r, SAMPLE_ANSWERS);
    expect(deficit).toBe(false);
    expect(slices.at(-1)?.key).toBe("margin");
    expect(slices.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1);
  });

  it("em déficit, o gráfico usa o total de gastos e não tem sobra", () => {
    const r = buildReport(deficitWithDebt);
    const { slices, deficit } = incomeSlices(r, deficitWithDebt);
    expect(deficit).toBe(true);
    expect(slices.some((s) => s.key === "margin")).toBe(false);
    expect(slices.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1);
  });
});

describe("cenários de projeção", () => {
  it("sem déficit, o cenário com ajuste é a projeção do relatório", () => {
    const r = buildReport(SAMPLE_ANSWERS);
    const [three, six, twelve] = projectionScenarios(r);
    expect(three.adjusted).toBeCloseTo(r.projection.threeMonths);
    expect(six.adjusted).toBeCloseTo(r.projection.sixMonths);
    expect(twelve.adjusted).toBeCloseTo(r.projection.twelveMonths);
    expect(twelve.current).toBeCloseTo(150 * 12);
  });

  it("em déficit, mostra o acumulado negativo e quanto o ajuste reduz", () => {
    const r = buildReport(deficitWithDebt);
    const twelve = projectionScenarios(r)[2];
    expect(twelve.current).toBeCloseTo(-1100 * 12);
    expect(twelve.adjusted).toBeCloseTo((-1100 + 120) * 12);
  });
});

it("resumo em uma frase usa os números da pessoa", () => {
  expect(summarySentence(buildReport(SAMPLE_ANSWERS))).toContain("sobram");
  expect(summarySentence(buildReport(deficitWithDebt))).toContain("faltam");
});
