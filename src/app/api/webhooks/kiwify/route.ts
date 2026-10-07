import type { NextRequest } from "next/server";
import { isDatabaseConfigured, recordPayment } from "@/lib/server/db";
import { isValidSignature, parseOrder } from "@/lib/server/kiwify";

/** Confirmação de pagamento da Kiwify (briefing, seção 44). */
export async function POST(request: NextRequest) {
  const token = process.env.KIWIFY_WEBHOOK_TOKEN ?? "";
  if (!token || !isDatabaseConfigured()) {
    console.error("[kiwify] webhook recebido sem KIWIFY_WEBHOOK_TOKEN ou banco configurado");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.nextUrl.searchParams.get("signature") ?? request.headers.get("x-kiwify-signature");
  if (!isValidSignature(raw, signature, token)) {
    console.warn("[kiwify] assinatura inválida", { hasSignature: Boolean(signature), bytes: raw.length });
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  const event = parseOrder(JSON.parse(raw));
  if (event.status === "ignored") {
    console.info("[kiwify] evento sem efeito", { order: event.orderId, type: event.eventType, status: event.orderStatus });
  }

  try {
    const result = await recordPayment(event);
    console.info("[kiwify] evento registrado", {
      order: event.orderId,
      type: event.eventType,
      status: event.status,
      viaS1: Boolean(event.diagnosticId),
      diagnostic: result.diagnosticId,
      applied: result.applied,
    });
    return Response.json({ ok: true, applied: result.applied });
  } catch (error) {
    // 500 faz a Kiwify tentar de novo.
    console.error("[kiwify] erro ao registrar pagamento", error);
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
