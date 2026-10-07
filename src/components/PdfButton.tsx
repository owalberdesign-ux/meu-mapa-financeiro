"use client";

import { Icon } from "@/components/Icon";
import { secondaryButtonClass } from "@/components/ui";
import { track } from "@/lib/analytics";

/** O PDF é o próprio relatório impresso com a folha de estilo A4 (briefing, seção 40). */
export function PdfButton({ name, className = secondaryButtonClass }: { name: string; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        track("download_pdf");
        const previous = document.title;
        // O título vira o nome sugerido do arquivo ao salvar como PDF.
        document.title = `Raio-X do Dinheiro — ${name}`;
        window.print();
        document.title = previous;
      }}
    >
      <Icon name="download" />
      Baixar meu Raio-X em PDF
    </button>
  );
}
