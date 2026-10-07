import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/report-builder";
import { SAMPLE_ANSWERS } from "@/lib/sample";
import { forClient, isUuid, parseLead } from "@/lib/server/diagnostics";
import type { Diagnostic } from "@/types/diagnostic";

const lead = { name: "  Mariana Souza ", email: "Mariana@Exemplo.com ", answers: SAMPLE_ANSWERS };

describe("validação do que chega do quiz", () => {
  it("aceita respostas completas e normaliza nome e e-mail", () => {
    expect(parseLead(lead)).toEqual({ name: "Mariana Souza", email: "mariana@exemplo.com", answers: SAMPLE_ANSWERS });
  });

  it("zera a dívida quando a pessoa disse que não tem", () => {
    const parsed = parseLead({ ...lead, answers: { ...SAMPLE_ANSWERS, hasDebt: false, debt: 5000 } });
    expect(parsed?.answers.debt).toBe(0);
  });

  it("recusa e-mail inválido, renda zero, valor negativo, texto e objetivo desconhecido", () => {
    expect(parseLead({ ...lead, email: "sem-arroba" })).toBeNull();
    expect(parseLead({ ...lead, answers: { ...SAMPLE_ANSWERS, income: 0 } })).toBeNull();
    expect(parseLead({ ...lead, answers: { ...SAMPLE_ANSWERS, housing: -1 } })).toBeNull();
    expect(parseLead({ ...lead, answers: { ...SAMPLE_ANSWERS, variable: "900" } })).toBeNull();
    expect(parseLead({ ...lead, answers: { ...SAMPLE_ANSWERS, goal: "ficar-rico" } })).toBeNull();
    expect(parseLead(null)).toBeNull();
  });

  it("reconhece UUID", () => {
    expect(isUuid("0b7c8f0e-6a1d-4c2e-9f1a-1234567890ab")).toBe(true);
    expect(isUuid("../../etc")).toBe(false);
  });
});

describe("conteúdo pago só depois do pagamento", () => {
  const report = buildReport(SAMPLE_ANSWERS);
  const base: Diagnostic = {
    id: "0b7c8f0e-6a1d-4c2e-9f1a-1234567890ab",
    name: "Mariana Souza",
    email: "mariana@exemplo.com",
    answers: SAMPLE_ANSWERS,
    report,
    paymentStatus: "pending",
    paymentId: null,
    createdAt: "2026-10-07T12:00:00Z",
    paidAt: null,
  };

  it("antes do pagamento: mantém o pré-diagnóstico e tira plano, rota e leituras", () => {
    const locked = forClient(base).report;
    expect(locked.score).toBe(report.score);
    expect(locked.metrics).toEqual(report.metrics);
    expect(locked.primaryProblem).toBe(report.primaryProblem);
    expect(locked.alerts).toHaveLength(report.alerts.length);
    expect(locked.alerts.every((a) => a.analysis === "" && a.firstStep === "")).toBe(true);
    expect(locked.plan30d).toEqual([]);
    expect(locked.route).toEqual([]);
    expect(locked.levers).toEqual([]);
    expect(JSON.stringify(locked)).not.toContain(report.plan30d[0].title);
  });

  it("estornado também fica bloqueado; pago recebe tudo", () => {
    expect(forClient({ ...base, paymentStatus: "refunded" }).report.plan30d).toEqual([]);
    expect(forClient({ ...base, paymentStatus: "paid" }).report).toEqual(report);
  });
});
