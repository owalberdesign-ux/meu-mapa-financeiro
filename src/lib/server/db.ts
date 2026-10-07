/**
 * Banco do Mapa no Supabase (schema "mapa"). Só roda no servidor.
 *
 * O site chama apenas as funções public.mapa_* (supabase/schema.sql), que só o papel service_role
 * executa: a secret key do Supabase (SUPABASE_SECRET_KEY) fica só aqui no servidor.
 */
import type { Answers, Diagnostic, PaymentStatus, Report } from "@/types/diagnostic";
import { buildReport } from "@/lib/report-builder";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? "";

export function isDatabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SECRET_KEY);
}

function authHeaders(): Record<string, string> {
  // Chave nova (sb_secret_…) vai só no apikey; a antiga (service_role, JWT) também no Authorization.
  return SECRET_KEY.startsWith("sb_")
    ? { apikey: SECRET_KEY }
    : { apikey: SECRET_KEY, Authorization: `Bearer ${SECRET_KEY}` };
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Supabase ${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

interface Row {
  id: string;
  name: string;
  email: string;
  answers: Answers;
  report_data: Report;
  payment_status: PaymentStatus;
  payment_id: string | null;
  created_at: string;
  paid_at: string | null;
}

function toDiagnostic(row: Row): Diagnostic {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    answers: row.answers,
    // Relatórios de uma versão anterior são refeitos a partir das respostas.
    report: row.report_data?.version === 2 ? row.report_data : buildReport(row.answers),
    paymentStatus: row.payment_status,
    paymentId: row.payment_id,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

export async function insertDiagnostic(input: { name: string; email: string; answers: Answers }): Promise<Diagnostic> {
  const report = buildReport(input.answers);
  const row = await rpc<Row>("mapa_create_diagnostic", {
    p_row: {
      name: input.name,
      email: input.email,
      answers: input.answers,
      score: report.score,
      profile: report.profile,
      primary_problem: report.primaryProblem,
      report_data: report,
    },
  });
  return toDiagnostic(row);
}

export async function findDiagnostic(id: string): Promise<Diagnostic | null> {
  const row = await rpc<Row | null>("mapa_get_diagnostic", { p_id: id });
  return row ? toDiagnostic(row) : null;
}

export interface PaymentEvent {
  diagnosticId: string | null;
  orderId: string | null;
  status: "paid" | "refunded" | "ignored";
  eventType: string | null;
  orderStatus: string | null;
  email: string | null;
}

/** Registra o aviso de pagamento e, quando dá para associar, atualiza o diagnóstico. */
export async function recordPayment(event: PaymentEvent): Promise<{ diagnosticId: string | null; applied: boolean }> {
  const result = await rpc<{ diagnostic_id: string | null; applied: boolean }>("mapa_record_payment", {
    p_event: {
      diagnostic_id: event.diagnosticId,
      order_id: event.orderId,
      status: event.status,
      event_type: event.eventType,
      order_status: event.orderStatus,
      email: event.email,
    },
  });
  return { diagnosticId: result.diagnostic_id, applied: result.applied };
}
