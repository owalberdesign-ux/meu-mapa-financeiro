import { isCheckoutConfigured } from "@/lib/checkout";
import { findDiagnostic, isDatabaseConfigured, recordPayment } from "@/lib/server/db";
import { forClient, isUuid } from "@/lib/server/diagnostics";

/**
 * Modo prévia: enquanto o checkout da Kiwify não está configurado, o botão de compra marca o
 * diagnóstico como pago para mostrar a entrega. Com o checkout configurado, esta rota fecha.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/diagnostics/[id]/simulate">) {
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }
  if (isCheckoutConfigured()) {
    return Response.json({ error: "checkout_enabled" }, { status: 403 });
  }
  const { id } = await ctx.params;
  if (!isUuid(id)) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  try {
    await recordPayment({
      diagnosticId: id,
      orderId: "previa",
      status: "paid",
      eventType: "previa",
      orderStatus: null,
      email: null,
    });
    const diagnostic = await findDiagnostic(id);
    if (!diagnostic) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json(forClient(diagnostic));
  } catch (error) {
    console.error("[diagnostics] erro na prévia de pagamento", error);
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
