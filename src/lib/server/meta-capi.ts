/**
 * API de Conversões do Meta: avisa a compra direto do servidor quando a Kiwify confirma o
 * pagamento, mesmo que a pessoa não volte ao site. O event_id é o ID do diagnóstico, o mesmo que o
 * Pixel usa no navegador (trackPurchaseOnce), então o Meta conta a compra uma vez só.
 * Dados pessoais vão só com hash SHA-256, como o Meta pede.
 */
import { createHash } from "node:crypto";

export interface Tracking {
  fbp?: string;
  fbc?: string;
  ip?: string;
  ua?: string;
}

const PRICE = { value: 37, currency: "BRL" } as const;
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v25.0";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const clean = (value: string) => value.trim().toLowerCase();

/** Telefone no formato que o Meta espera: só dígitos, com o código do país (55). */
export function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) return digits;
  return null;
}

export function buildPurchaseEvent(input: {
  diagnosticId: string;
  emails: (string | null | undefined)[];
  phone?: string | null;
  name?: string | null;
  tracking?: Tracking | null;
  siteUrl: string;
  eventTime?: number;
}) {
  const emails = [...new Set(input.emails.filter((e): e is string => Boolean(e && e.includes("@"))).map(clean))];
  const parts = (input.name ?? "").trim().split(/\s+/).filter(Boolean);
  const phone = normalizePhone(input.phone);
  const t = input.tracking ?? {};

  const userData: Record<string, unknown> = { external_id: [sha256(input.diagnosticId)] };
  if (emails.length) userData.em = emails.map(sha256);
  if (phone) userData.ph = [sha256(phone)];
  if (parts.length) userData.fn = [sha256(clean(parts[0]))];
  if (parts.length > 1) userData.ln = [sha256(clean(parts[parts.length - 1]))];
  if (t.fbp) userData.fbp = t.fbp;
  if (t.fbc) userData.fbc = t.fbc;
  if (t.ip) userData.client_ip_address = t.ip;
  if (t.ua) userData.client_user_agent = t.ua;

  return {
    event_name: "Purchase",
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.diagnosticId,
    action_source: "website",
    event_source_url: `${input.siteUrl}/resultado/${input.diagnosticId}`,
    user_data: userData,
    custom_data: { ...PRICE, content_name: "Meu Mapa Financeiro" },
  };
}

export function isConversionsApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.META_CAPI_TOKEN);
}

/** Envia a compra. Nunca lança erro: uma falha aqui não pode atrapalhar a liberação do Mapa. */
export async function sendPurchase(input: Parameters<typeof buildPurchaseEvent>[0]): Promise<void> {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;
  const testCode = process.env.META_CAPI_TEST_CODE;
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixel}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [buildPurchaseEvent(input)],
        access_token: token,
        ...(testCode ? { test_event_code: testCode } : {}),
      }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    const text = (await res.text()).slice(0, 300);
    if (res.ok) console.info("[meta] compra enviada pela API de Conversões", { diagnostic: input.diagnosticId, resposta: text });
    else console.error("[meta] API de Conversões recusou a compra", { status: res.status, resposta: text });
  } catch (error) {
    console.error("[meta] falha ao enviar a compra", error);
  }
}
