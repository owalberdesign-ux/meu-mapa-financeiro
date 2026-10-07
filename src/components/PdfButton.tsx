"use client";

import { useState } from "react";
import type { Diagnostic } from "@/types/diagnostic";
import { Icon } from "@/components/Icon";
import { secondaryButtonClass } from "@/components/ui";
import { track } from "@/lib/analytics";

function fileName(name: string) {
  // Sem acentos: alguns navegadores trocam nomes com acento por "download".
  const safe =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w .-]+/g, "")
      .trim() || "relatorio";
  return `Raio-X do Dinheiro - ${safe}.pdf`;
}

/** Baixa o relatório em PDF, montado com os números desta pessoa. */
export function PdfButton({
  diagnostic,
  className = secondaryButtonClass,
}: {
  diagnostic: Diagnostic;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (busy) return;
    setBusy(true);
    track("download_pdf");
    try {
      const { renderReportPdf } = await import("@/components/pdf/render");
      const blob = await renderReportPdf(diagnostic, window.location.origin, window.location.href.split("#")[0]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName(diagnostic.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error(error);
      // Se a geração falhar, a impressão do navegador ainda entrega o relatório.
      window.print();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} onClick={download} disabled={busy} aria-busy={busy}>
      {busy ? (
        <span className="size-5 animate-spin rounded-full border-2 border-current/30 border-t-current motion-reduce:animate-none" />
      ) : (
        <Icon name="download" />
      )}
      {busy ? "Gerando seu PDF…" : "Baixar meu Raio-X em PDF"}
    </button>
  );
}
