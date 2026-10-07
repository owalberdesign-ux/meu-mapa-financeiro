/**
 * Único lugar que conhece a URL do checkout Kiwify (briefing, seção 28).
 * `s1` leva o ID do diagnóstico para o webhook associar o pagamento.
 */
const CHECKOUT_URL = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ?? "";

export const PRICE_LABEL = "R$37";

export function isCheckoutConfigured(): boolean {
  return CHECKOUT_URL.length > 0;
}

export function buildCheckoutUrl({
  diagnosticId,
  name,
  email,
}: {
  diagnosticId: string;
  name: string;
  email: string;
}): string | null {
  if (!CHECKOUT_URL) return null;
  const url = new URL(CHECKOUT_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  url.searchParams.set("s1", diagnosticId);
  return url.toString();
}
