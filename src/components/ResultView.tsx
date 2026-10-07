"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Diagnostic } from "@/types/diagnostic";
import { Icon } from "@/components/Icon";
import { FullReport, LockedReport, PreviewResult, ReadyBanner } from "@/components/report";
import { Logo, buttonClass } from "@/components/ui";
import { track } from "@/lib/analytics";
import { buildCheckoutUrl, isCheckoutConfigured, PRICE_LABEL } from "@/lib/checkout";
import { getDiagnostic, simulatePayment } from "@/lib/diagnostic-store";
import { firstName } from "@/lib/format";
import { DISCLAIMER } from "@/lib/legal";

type State = { status: "loading" } | { status: "missing" } | { status: "ready"; diagnostic: Diagnostic };

export function ResultView({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getDiagnostic(id).then((diagnostic) => {
      if (active) setState(diagnostic ? { status: "ready", diagnostic } : { status: "missing" });
    });
    return () => {
      active = false;
    };
  }, [id]);

  const paid = state.status === "ready" && state.diagnostic.paymentStatus === "paid";

  useEffect(() => {
    if (state.status !== "ready") return;
    track(paid ? "view_report" : "view_preview");
  }, [state.status, paid]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-4 print:hidden">
        <Logo />
      </header>

      {state.status === "loading" ? (
        <ResultSkeleton />
      ) : state.status === "missing" ? (
        <Missing />
      ) : paid ? (
        <div className="space-y-12 animate-rise motion-reduce:animate-none">
          <ReadyBanner diagnostic={state.diagnostic} />
          <FullReport diagnostic={state.diagnostic} />
        </div>
      ) : (
        <Preview
          diagnostic={state.diagnostic}
          onPaid={(diagnostic) => {
            setState({ status: "ready", diagnostic });
            window.scrollTo({ top: 0 });
          }}
        />
      )}
    </div>
  );
}

function Preview({
  diagnostic,
  onPaid,
}: {
  diagnostic: Diagnostic;
  onPaid: (d: Diagnostic) => void;
}) {
  const [redirecting, setRedirecting] = useState(false);
  const previewMode = !isCheckoutConfigured();

  async function checkout() {
    setRedirecting(true);
    track("click_checkout");
    const url = buildCheckoutUrl({
      diagnosticId: diagnostic.id,
      name: diagnostic.name,
      email: diagnostic.email,
    });
    if (url) {
      window.location.href = url;
      return;
    }
    // Prévia sem Kiwify configurada: simula a aprovação para mostrar a entrega.
    await new Promise((r) => setTimeout(r, 700));
    const paid = await simulatePayment(diagnostic.id);
    if (paid) {
      track("purchase", { preview: true });
      onPaid(paid);
    } else {
      setRedirecting(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise motion-reduce:animate-none">
      <div className="pt-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
          Pré-diagnóstico
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
          {firstName(diagnostic.name)}, este é o retrato do seu mês.
        </h1>
      </div>

      <PreviewResult diagnostic={diagnostic} />

      <LockedReport
        report={diagnostic.report}
        cta={
          <>
            <button type="button" onClick={checkout} disabled={redirecting} className={`${buttonClass} sm:w-full`}>
              {redirecting ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
                  {previewMode ? "Liberando…" : "Indo para o pagamento…"}
                </>
              ) : (
                <>
                  Desbloquear meu Raio-X — {PRICE_LABEL}
                  <Icon name="arrowRight" />
                </>
              )}
            </button>
            <p className="mt-3 text-center text-sm text-white/70">
              Pagamento via PIX ou cartão. Relatório liberado após aprovação.
            </p>
            {previewMode ? (
              <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-center text-[13px] text-white/75">
                Versão de prévia: o checkout ainda não está conectado, então o botão simula o pagamento
                aprovado.
              </p>
            ) : null}
          </>
        }
      />

      <p className="text-[13px] leading-relaxed text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function Missing() {
  return (
    <div className="pt-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Não encontramos este diagnóstico.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Ele pode ter sido feito em outro aparelho ou navegador. Refaça o quiz para gerar um novo Raio-X.
      </p>
      <div className="mt-8">
        <Link href="/diagnostico" className={buttonClass}>
          Fazer meu Raio-X
          <Icon name="arrowRight" />
        </Link>
      </div>
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div className="space-y-6 pt-4" aria-busy="true" aria-label="Carregando seu diagnóstico">
      <div className="h-4 w-32 animate-pulse rounded bg-track" />
      <div className="h-9 w-3/4 animate-pulse rounded-lg bg-track" />
      <div className="h-80 animate-pulse rounded-3xl bg-surface" />
      <div className="h-72 animate-pulse rounded-[2rem] bg-track" />
    </div>
  );
}
