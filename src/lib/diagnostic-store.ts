/**
 * Onde os diagnósticos ficam salvos.
 *
 * Fase 1 (agora): só no navegador da pessoa (localStorage), com cópia em
 * memória para funcionar mesmo com o armazenamento bloqueado.
 * Fase 2: trocar o corpo destas funções por chamadas a /api/diagnostics
 * (Supabase). As assinaturas já são assíncronas para a troca não mexer nos
 * componentes.
 */
import type { Answers, Diagnostic } from "@/types/diagnostic";
import { buildReport } from "@/lib/report-builder";

const memory = new Map<string, Diagnostic>();
const key = (id: string) => `rxd:diagnostic:${id}`;

function persist(diagnostic: Diagnostic): void {
  memory.set(diagnostic.id, diagnostic);
  try {
    localStorage.setItem(key(diagnostic.id), JSON.stringify(diagnostic));
  } catch {
    // Navegação privada ou armazenamento cheio: segue com a cópia em memória.
  }
}

export async function createDiagnostic(input: {
  name: string;
  email: string;
  answers: Answers;
}): Promise<Diagnostic> {
  const diagnostic: Diagnostic = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    answers: input.answers,
    report: buildReport(input.answers),
    paymentStatus: "pending",
    paymentId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  persist(diagnostic);
  return diagnostic;
}

export async function getDiagnostic(id: string): Promise<Diagnostic | null> {
  const cached = memory.get(id);
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as Diagnostic) : null;
  } catch {
    return null;
  }
}

/**
 * Só para a prévia sem checkout configurado. Na fase 2 quem marca como pago é
 * o webhook da Kiwify, no servidor.
 */
export async function simulatePayment(id: string): Promise<Diagnostic | null> {
  const diagnostic = await getDiagnostic(id);
  if (!diagnostic) return null;
  const paid: Diagnostic = {
    ...diagnostic,
    paymentStatus: "paid",
    paymentId: "previa",
    paidAt: new Date().toISOString(),
  };
  persist(paid);
  return paid;
}
