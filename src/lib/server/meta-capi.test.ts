import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildPurchaseEvent, normalizePhone } from "@/lib/server/meta-capi";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const ID = "0b7c8f0e-6a1d-4c2e-9f1a-1234567890ab";

describe("compra para a API de Conversões", () => {
  const event = buildPurchaseEvent({
    diagnosticId: ID,
    emails: ["Mariana@Exemplo.com ", "mariana@exemplo.com", null],
    phone: "(11) 98765-4321",
    name: "Mariana Souza Lima",
    tracking: { fbp: "fb.1.1700000000.123", fbc: "fb.1.1700000000.abc", ip: "200.1.2.3", ua: "Mozilla/5.0" },
    siteUrl: "https://meu-mapa-financeiro.vercel.app",
    eventTime: 1791400000,
  });

  it("usa o ID do diagnóstico como event_id, igual ao Pixel no navegador", () => {
    expect(event.event_name).toBe("Purchase");
    expect(event.event_id).toBe(ID);
    expect(event.action_source).toBe("website");
    expect(event.event_source_url).toBe(`https://meu-mapa-financeiro.vercel.app/resultado/${ID}`);
    expect(event.custom_data).toMatchObject({ value: 37, currency: "BRL" });
  });

  it("manda e-mail, telefone e nome só com hash, normalizados", () => {
    expect(event.user_data.em).toEqual([sha("mariana@exemplo.com")]);
    expect(event.user_data.ph).toEqual([sha("5511987654321")]);
    expect(event.user_data.fn).toEqual([sha("mariana")]);
    expect(event.user_data.ln).toEqual([sha("lima")]);
    const json = JSON.stringify(event);
    expect(json).not.toContain("mariana@");
    expect(json).not.toContain("98765");
  });

  it("repassa os identificadores do anúncio sem hash", () => {
    expect(event.user_data).toMatchObject({ fbp: "fb.1.1700000000.123", fbc: "fb.1.1700000000.abc", client_ip_address: "200.1.2.3", client_user_agent: "Mozilla/5.0" });
  });

  it("sem dados extras, manda só o que tem", () => {
    const min = buildPurchaseEvent({ diagnosticId: ID, emails: [], siteUrl: "https://x" });
    expect(Object.keys(min.user_data)).toEqual(["external_id"]);
  });
});

describe("telefone", () => {
  it("põe o 55 e tira a formatação", () => {
    expect(normalizePhone("(21) 3333-4444")).toBe("552133334444");
    expect(normalizePhone("+55 11 98765-4321")).toBe("5511987654321");
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});
