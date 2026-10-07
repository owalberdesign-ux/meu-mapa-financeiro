import { insertDiagnostic, isDatabaseConfigured } from "@/lib/server/db";
import { forClient, parseLead } from "@/lib/server/diagnostics";

/** Cria o diagnóstico a partir do quiz. O relatório é calculado aqui, no servidor. */
export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }
  const lead = parseLead(await request.json().catch(() => null));
  if (!lead) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  try {
    const diagnostic = await insertDiagnostic(lead);
    return Response.json(forClient(diagnostic), { status: 201 });
  } catch (error) {
    console.error("[diagnostics] erro ao salvar", error);
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
