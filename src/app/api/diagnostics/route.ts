import type { NextRequest } from "next/server";
import { insertDiagnostic, isDatabaseConfigured } from "@/lib/server/db";
import { forClient, parseLead } from "@/lib/server/diagnostics";
import type { Tracking } from "@/lib/server/meta-capi";

/** Identificadores do anúncio, para o Meta ligar a compra ao clique (API de Conversões). */
function trackingFrom(request: NextRequest): Tracking {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    fbp: request.cookies.get("_fbp")?.value?.slice(0, 200),
    fbc: request.cookies.get("_fbc")?.value?.slice(0, 300),
    ip: ip ? ip.slice(0, 64) : undefined,
    ua: request.headers.get("user-agent")?.slice(0, 400) ?? undefined,
  };
}

/** Cria o diagnóstico a partir do quiz. O relatório é calculado aqui, no servidor. */
export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }
  const lead = parseLead(await request.json().catch(() => null));
  if (!lead) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  try {
    const diagnostic = await insertDiagnostic({ ...lead, tracking: trackingFrom(request) });
    return Response.json(forClient(diagnostic), { status: 201 });
  } catch (error) {
    console.error("[diagnostics] erro ao salvar", error);
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
