import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Faça o seu Mapa Financeiro",
};

export default function DiagnosticoPage() {
  return <Quiz />;
}
