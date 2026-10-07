import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu Mapa Financeiro — descubra por que seu dinheiro não sobra e a rota para mudar isso",
  description:
    "Responda algumas perguntas e receba seu score financeiro, os pontos de atenção, a rota até o seu objetivo e um plano personalizado para os próximos 30 dias. Sem conectar sua conta bancária.",
};

export const viewport: Viewport = {
  themeColor: "#f6f7f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
