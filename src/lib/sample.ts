import type { Answers, Diagnostic } from "@/types/diagnostic";
import { buildReport } from "@/lib/report-builder";

/** Pessoa fictícia usada na prévia do hero e na página /exemplo. */
export const SAMPLE_ANSWERS: Answers = {
  income: 4500,
  housing: 1600,
  essential: 1500,
  variable: 650,
  installments: 600,
  hasDebt: false,
  debt: 0,
  saving: 100,
  reserve: 1800,
  goal: "surplus",
};

export const SAMPLE_DIAGNOSTIC: Diagnostic = {
  id: "exemplo",
  name: "Mariana Souza",
  email: "mariana@exemplo.com",
  answers: SAMPLE_ANSWERS,
  report: buildReport(SAMPLE_ANSWERS),
  paymentStatus: "paid",
  paymentId: null,
  createdAt: "2026-10-07T12:00:00.000Z",
  paidAt: "2026-10-07T12:05:00.000Z",
};
