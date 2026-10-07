import { createHash, createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TOKEN = "token-kiwify";
const ID = "0b7c8f0e-6a1d-4c2e-9f1a-1234567890ab";
const sha = (v: string) => createHash("sha256").update(v).digest("hex");

type Call = { url: string; body: Record<string, unknown> };
let calls: Call[];

function kiwifyRequest(payload: unknown) {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha1", TOKEN).update(body).digest("hex");
  return new NextRequest(`https://meu-mapa-financeiro.vercel.app/api/webhooks/kiwify?signature=${signature}`, {
    method: "POST",
    body,
  });
}

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

beforeEach(() => {
  calls = [];
  vi.stubEnv("KIWIFY_WEBHOOK_TOKEN", TOKEN);
  vi.stubEnv("SUPABASE_URL", "https://banco.exemplo");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_teste");
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "2301523480674052");
  vi.stubEnv("META_CAPI_TOKEN", "EAA-teste");
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body ?? "{}"));
    calls.push({ url, body });
    if (url.endsWith("/rpc/mapa_record_payment")) {
      const status = (body.p_event as { status: string }).status;
      return Response.json({ diagnostic_id: ID, applied: status !== "ignored" });
    }
    if (url.endsWith("/rpc/mapa_get_diagnostic")) {
      return Response.json({ id: ID, name: "Mariana Souza", email: "mariana@exemplo.com", tracking: { fbp: "fb.1.1.2", ua: "Mozilla" } });
    }
    if (url.startsWith("https://graph.facebook.com/")) return Response.json({ events_received: 1 });
    return new Response("inesperado", { status: 500 });
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("webhook da Kiwify + API de Conversões", () => {
  it("compra aprovada: libera e avisa o Meta com o mesmo event_id do Pixel", async () => {
    const { POST } = await loadRoute();
    const res = await POST(kiwifyRequest({
      order_id: "pedido-1",
      order_status: "paid",
      webhook_event_type: "order_approved",
      Customer: { email: "Mariana@Exemplo.com", mobile: "11987654321" },
      TrackingParameters: { s1: ID },
    }));
    expect(res.status).toBe(200);
    const meta = calls.find((c) => c.url.startsWith("https://graph.facebook.com/"));
    expect(meta?.url).toBe("https://graph.facebook.com/v25.0/2301523480674052/events");
    const [event] = meta!.body.data as Array<{ event_name: string; event_id: string; user_data: Record<string, unknown> }>;
    expect(event.event_name).toBe("Purchase");
    expect(event.event_id).toBe(ID);
    expect(event.user_data.em).toEqual([sha("mariana@exemplo.com")]);
    expect(event.user_data.ph).toEqual([sha("5511987654321")]);
    expect(event.user_data.fbp).toBe("fb.1.1.2");
    expect(meta!.body.access_token).toBe("EAA-teste");
  });

  it("reembolso e PIX gerado não avisam compra", async () => {
    const { POST } = await loadRoute();
    await POST(kiwifyRequest({ order_id: "pedido-1", order_status: "refunded", webhook_event_type: "order_refunded" }));
    await POST(kiwifyRequest({ order_id: "pedido-2", order_status: "waiting_payment", webhook_event_type: "pix_created" }));
    expect(calls.some((c) => c.url.startsWith("https://graph.facebook.com/"))).toBe(false);
  });

  it("sem token do Meta, a compra é liberada normalmente e nada vai para o Meta", async () => {
    vi.stubEnv("META_CAPI_TOKEN", "");
    const { POST } = await loadRoute();
    const res = await POST(kiwifyRequest({ order_id: "pedido-3", order_status: "paid", TrackingParameters: { s1: ID } }));
    expect(res.status).toBe(200);
    expect(calls.some((c) => c.url.startsWith("https://graph.facebook.com/"))).toBe(false);
  });

  it("se o Meta falhar, o webhook continua respondendo 200", async () => {
    const original = globalThis.fetch;
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) =>
      url.startsWith("https://graph.facebook.com/") ? new Response("erro", { status: 500 }) : original(url, init));
    const { POST } = await loadRoute();
    const res = await POST(kiwifyRequest({ order_id: "pedido-4", order_status: "paid", TrackingParameters: { s1: ID } }));
    expect(res.status).toBe(200);
  });

  it("assinatura errada é recusada", async () => {
    const { POST } = await loadRoute();
    const req = new NextRequest("https://meu-mapa-financeiro.vercel.app/api/webhooks/kiwify?signature=errada", {
      method: "POST",
      body: JSON.stringify({ order_status: "paid" }),
    });
    expect((await POST(req)).status).toBe(401);
    expect(calls).toHaveLength(0);
  });
});
