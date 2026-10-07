/**
 * Avisos de venda da Kiwify (webhook).
 *
 * A Kiwify manda o pedido em JSON e a assinatura no parâmetro `signature` da URL: HMAC-SHA1 do
 * corpo com o token do webhook. O ID do diagnóstico volta em TrackingParameters.s1, porque o
 * checkout é aberto com `s1` (src/lib/checkout.ts).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentEvent } from "@/lib/server/db";

function sameHex(a: string, b: string): boolean {
  const x = Buffer.from(a.toLowerCase());
  const y = Buffer.from(b.toLowerCase());
  return x.length === y.length && timingSafeEqual(x, y);
}

export function isValidSignature(rawBody: string, signature: string | null, token: string): boolean {
  if (!signature || !token) return false;
  const candidates = [rawBody];
  try {
    // Mesmo JSON sem espaços extras, caso o corpo chegue formatado.
    candidates.push(JSON.stringify(JSON.parse(rawBody)));
  } catch {
    return false;
  }
  return candidates.some((body) => sameHex(createHmac("sha1", token).update(body).digest("hex"), signature));
}

const PAID_STATUS = new Set(["paid", "approved"]);
const PAID_EVENTS = new Set(["order_approved"]);
const REFUND_STATUS = new Set(["refunded", "chargedback"]);
const REFUND_EVENTS = new Set(["order_refunded", "chargeback"]);

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : typeof value === "number" ? String(value) : null;
}

function pick(obj: unknown, ...keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  for (const k of keys) if (o[k] !== undefined) return o[k];
  return undefined;
}

export function parseOrder(payload: unknown): PaymentEvent {
  const orderStatus = text(pick(payload, "order_status"))?.toLowerCase() ?? null;
  const eventType = text(pick(payload, "webhook_event_type"))?.toLowerCase() ?? null;
  const tracking = pick(payload, "TrackingParameters", "tracking_parameters");
  const customer = pick(payload, "Customer", "customer");

  let status: PaymentEvent["status"] = "ignored";
  if ((orderStatus && REFUND_STATUS.has(orderStatus)) || (eventType && REFUND_EVENTS.has(eventType))) {
    status = "refunded";
  } else if ((orderStatus && PAID_STATUS.has(orderStatus)) || (eventType && PAID_EVENTS.has(eventType))) {
    status = "paid";
  }

  return {
    diagnosticId: text(pick(tracking, "s1")),
    orderId: text(pick(payload, "order_id", "order_ref")),
    status,
    eventType,
    orderStatus,
    email: text(pick(customer, "email"))?.toLowerCase() ?? null,
  };
}
