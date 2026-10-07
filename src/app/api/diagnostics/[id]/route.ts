import { findDiagnostic, isDatabaseConfigured } from "@/lib/server/db";
import { forClient, isUuid } from "@/lib/server/diagnostics";

/** Pré-diagnóstico enquanto não há pagamento; relatório completo depois da confirmação. */
export async function GET(_request: Request, ctx: RouteContext<"/api/diagnostics/[id]">) {
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }
  const { id } = await ctx.params;
  if (!isUuid(id)) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  try {
    const diagnostic = await findDiagnostic(id);
    if (!diagnostic) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json(forClient(diagnostic), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[diagnostics] erro ao buscar", error);
    return Response.json({ error: "load_failed" }, { status: 500 });
  }
}
