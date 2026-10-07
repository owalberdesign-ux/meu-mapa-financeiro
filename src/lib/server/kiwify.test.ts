import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isValidSignature, parseOrder } from "@/lib/server/kiwify";

const TOKEN = "token-de-teste";
const sign = (body: string) => createHmac("sha1", TOKEN).update(body).digest("hex");

const approved = {
  order_id: "abc-123",
  order_status: "paid",
  webhook_event_type: "order_approved",
  Customer: { full_name: "Mariana Souza", email: "Mariana@Exemplo.com" },
  TrackingParameters: { s1: "0b7c8f0e-6a1d-4c2e-9f1a-1234567890ab", src: null },
};

describe("assinatura da Kiwify", () => {
  it("aceita HMAC-SHA1 do corpo com o token", () => {
    const body = JSON.stringify(approved);
    expect(isValidSignature(body, sign(body), TOKEN)).toBe(true);
    expect(isValidSignature(body, sign(body).toUpperCase(), TOKEN)).toBe(true);
  });

  it("aceita o corpo formatado quando a assinatura é do JSON compacto", () => {
    const pretty = JSON.stringify(approved, null, 2);
    expect(isValidSignature(pretty, sign(JSON.stringify(approved)), TOKEN)).toBe(true);
  });

  it("recusa assinatura ausente, errada, de outro token ou corpo inválido", () => {
    const body = JSON.stringify(approved);
    expect(isValidSignature(body, null, TOKEN)).toBe(false);
    expect(isValidSignature(body, "abc", TOKEN)).toBe(false);
    expect(isValidSignature(body, createHmac("sha1", "outro").update(body).digest("hex"), TOKEN)).toBe(false);
    expect(isValidSignature(body, sign(body), "")).toBe(false);
    expect(isValidSignature("não é json", sign("não é json"), TOKEN)).toBe(false);
  });
});

describe("leitura do pedido", () => {
  it("compra aprovada traz s1, pedido e e-mail", () => {
    expect(parseOrder(approved)).toEqual({
      diagnosticId: "0b7c8f0e-6a1d-4c2e-9f1a-1234567890ab",
      orderId: "abc-123",
      status: "paid",
      eventType: "order_approved",
      orderStatus: "paid",
      email: "mariana@exemplo.com",
    });
  });

  it("reembolso e chargeback viram estorno", () => {
    expect(parseOrder({ ...approved, order_status: "refunded", webhook_event_type: "order_refunded" }).status).toBe("refunded");
    expect(parseOrder({ ...approved, order_status: "chargedback", webhook_event_type: "chargeback" }).status).toBe("refunded");
  });

  it("PIX gerado, boleto e recusa não mudam nada", () => {
    expect(parseOrder({ ...approved, order_status: "waiting_payment", webhook_event_type: "pix_created" }).status).toBe("ignored");
    expect(parseOrder({ ...approved, order_status: "refused", webhook_event_type: "order_rejected" }).status).toBe("ignored");
  });

  it("aguenta payload sem rastreamento nem cliente", () => {
    expect(parseOrder({ order_id: 99, order_status: "paid" })).toMatchObject({
      diagnosticId: null,
      orderId: "99",
      status: "paid",
      email: null,
    });
    expect(parseOrder(null).status).toBe("ignored");
  });
});
