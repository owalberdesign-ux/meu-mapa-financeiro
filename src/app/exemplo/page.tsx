import type { Metadata } from "next";
import { FullReport, ReadyBanner } from "@/components/report";
import { Logo } from "@/components/ui";
import { SAMPLE_DIAGNOSTIC } from "@/lib/sample";

export const metadata: Metadata = {
  title: "Exemplo de relatório — Meu Mapa Financeiro",
  robots: { index: false, follow: false },
};

/** Relatório pago completo com dados fictícios, para revisar a entrega. */
export default function ExemploPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-4 print:hidden">
        <Logo />
        <span className="rounded-full border border-line px-3 py-1 text-[13px] text-muted">
          Exemplo com dados fictícios
        </span>
      </header>
      <div className="space-y-12">
        <ReadyBanner diagnostic={SAMPLE_DIAGNOSTIC} />
        <FullReport diagnostic={SAMPLE_DIAGNOSTIC} />
      </div>
    </div>
  );
}
