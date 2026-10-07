import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Faça seu Raio-X do Dinheiro",
};

export default function DiagnosticoPage() {
  return <Quiz />;
}
