import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultSkeleton, ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Seu Mapa Financeiro",
  robots: { index: false, follow: false },
};

export default function ResultadoPage({ params }: PageProps<"/resultado/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <ResultSkeleton />
        </div>
      }
    >
      {params.then(({ id }) => (
        <ResultView id={id} />
      ))}
    </Suspense>
  );
}
