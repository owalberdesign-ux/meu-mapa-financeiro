/**
 * Onde os diagnósticos ficam salvos, do ponto de vista da tela.
 *
 * Com o banco configurado, tudo passa pelas rotas /api/diagnostics: o relatório é calculado no
 * servidor e o conteúdo pago só chega depois da confirmação do pagamento. Sem banco (rota responde
 * 501), segue o modo local: o diagnóstico fica só no navegador, como na prévia original.
 * Diagnósticos locais antigos continuam abrindo no aparelho em que foram feitos.
 */
import type { Answers, Diagnostic } from "@/types/diagnostic";
import { buildReport } from "@/lib/report-builder";

const memory = new Map<string, Diagnostic>();
const key = (id: string) => `rxd:diagnostic:${id}`;

/* ---------- modo local (sem banco) ---------- */

function persistLocal(diagnostic: Diagnostic): void {
  memory.set(diagnostic.id, diagnostic);
  try {
    localStorage.setItem(key(diagnostic.id), JSON.stringify(diagnostic));
  } catch {
    // Navegação privada ou armazenamento cheio: segue com a cópia em memória.
  }
}

function createLocal(input: { name: string; email: string; answers: Answers }): Diagnostic {
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
  persistLocal(diagnostic);
  return diagnostic;
}

function getLocal(id: string): Diagnostic | null {
  const cached = memory.get(id);
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(key(id));
    if (!raw) return null;
    const diagnostic = JSON.parse(raw) as Diagnostic;
    if (diagnostic.report?.version === 2) return diagnostic;
    // Relatório de uma versão anterior: refeito a partir das respostas.
    const upgraded = { ...diagnostic, report: buildReport(diagnostic.answers) };
    persistLocal(upgraded);
    return upgraded;
  } catch {
    return null;
  }
}

/* ---------- API ---------- */

export async function createDiagnostic(input: {
  name: string;
  email: string;
  answers: Answers;
}): Promise<Diagnostic> {
  const res = await fetch("/api/diagnostics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 501) return createLocal(input);
  if (!res.ok) throw new Error(`Falha ao salvar o diagnóstico (${res.status})`);
  return (await res.json()) as Diagnostic;
}

/** `null` quando o diagnóstico não existe; erro quando não deu para consultar agora. */
export async function getDiagnostic(id: string): Promise<Diagnostic | null> {
  const local = getLocal(id);
  if (local) return local;
  const res = await fetch(`/api/diagnostics/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (res.status === 404 || res.status === 501) return null;
  if (!res.ok) throw new Error(`Falha ao abrir o diagnóstico (${res.status})`);
  return (await res.json()) as Diagnostic;
}

/**
 * Só para a prévia sem checkout configurado. Com o checkout da Kiwify ligado, quem marca como
 * pago é o webhook, no servidor.
 */
export async function simulatePayment(id: string): Promise<Diagnostic | null> {
  const local = getLocal(id);
  if (local) {
    const paid: Diagnostic = { ...local, paymentStatus: "paid", paymentId: "previa", paidAt: new Date().toISOString() };
    persistLocal(paid);
    return paid;
  }
  const res = await fetch(`/api/diagnostics/${encodeURIComponent(id)}/simulate`, { method: "POST" });
  return res.ok ? ((await res.json()) as Diagnostic) : null;
}

/* ---------- volta do checkout ---------- */

const CHECKOUT_KEY = "mmf:checkout";

/** Lembra qual diagnóstico foi para o pagamento, para a página de obrigado trazer a pessoa de volta. */
export function rememberCheckout(id: string): void {
  try {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {}
}

/** Diagnóstico que foi para o pagamento dentro da janela informada (padrão: 48 horas). */
export function lastCheckout(maxAgeMs = 48 * 3600_000): string | null {
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKOUT_KEY) ?? "null") as { id: string; at: number } | null;
    return saved && Date.now() - saved.at < maxAgeMs ? saved.id : null;
  } catch {
    return null;
  }
}
