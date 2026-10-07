import type { Metadata } from "next";
import { BackFromCheckout } from "@/components/BackFromCheckout";

export const metadata: Metadata = {
  title: "Pagamento recebido — Meu Mapa Financeiro",
  robots: { index: false, follow: false },
};

/** Página de obrigado configurada no produto da Kiwify: leva a pessoa de volta ao Mapa dela. */
export default function ObrigadoPage() {
  return <BackFromCheckout />;
}
