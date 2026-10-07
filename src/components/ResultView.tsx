"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Diagnostic } from "@/types/diagnostic";
import { Icon } from "@/components/Icon";
import { FullReport, LockedReport, PreviewResult, ReadyBanner } from "@/components/report";
import { Logo, buttonClass, buttonFullClass } from "@/components/ui";
import { track, trackPurchaseOnce } from "@/lib/analytics";
import { buildCheckoutUrl, isCheckoutConfigured, PRICE_LABEL } from "@/lib/checkout";
import { getDiagnostic, lastCheckout, rememberCheckout, simulatePayment } from "@/lib/diagnostic-store";
import { firstName } from "@/lib/format";
import { DISCLAIMER } from "@/lib/legal";

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; diagnostic: Diagnostic };

/** Primeiros 2 minutos depois da compra: confere a cada 4 s; depois, a cada 15 s. */
const FAST_POLL_MS = 4_000;
const SLOW_POLL_MS = 15_000;
const FAST_WINDOW_MS = 120_000;

export function ResultView({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  // Voltou da Kiwify (?compra=1) ou saiu daqui para o pagamento: espera a confirmação.
  const cameFromCheckout = useSearchParams().get("compra") === "1";
  const [awaiting, setAwaiting] = useState(false);
  const startedAt = useRef(0);

  const load = useCallback(async () => {
    try {
      const diagnostic = await getDiagnostic(id);
      setState(diagnostic ? { status: "ready", diagnostic } : { status: "missing" });
    } catch {
      setState((prev) => (prev.status === "ready" ? prev : { status: "error" }));
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    getDiagnostic(id)
      .then((diagnostic) => {
        if (!active) return;
        setState(diagnostic ? { status: "ready", diagnostic } : { status: "missing" });
        if (diagnostic && diagnostic.paymentStatus !== "paid" && (cameFromCheckout || lastCheckout(2 * 3600_000) === id)) {
          startedAt.current = Date.now();
          setAwaiting(true);
        }
      })
      .catch(() => active && setState({ status: "error" }));
    return () => {
      active = false;
    };
  }, [id, cameFromCheckout]);

  const paid = state.status === "ready" && state.diagnostic.paymentStatus === "paid";

  useEffect(() => {
    if (state.status !== "ready") return;
    track(paid ? "view_report" : "view_preview");
  }, [state.status, paid]);

  useEffect(() => {
    if (paid && state.status === "ready") trackPurchaseOnce(state.diagnostic);
  }, [paid, state]);

  // Enquanto o pagamento não confirma, confere de novo sozinho e quando a pessoa volta para a aba.
  useEffect(() => {
    if (!awaiting || paid) return;
    let timer: number;
    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      timer = window.setTimeout(async () => {
        await load();
        tick();
      }, elapsed < FAST_WINDOW_MS ? FAST_POLL_MS : SLOW_POLL_MS);
    };
    tick();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [awaiting, paid, load]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-4 print:hidden">
        <Logo />
      </header>

      {state.status === "loading" ? (
        <ResultSkeleton />
      ) : state.status === "missing" ? (
        <Missing />
      ) : state.status === "error" ? (
        <LoadError onRetry={load} />
      ) : paid ? (
        <div className="space-y-12 animate-rise motion-reduce:animate-none">
          <ReadyBanner diagnostic={state.diagnostic} />
          <FullReport diagnostic={state.diagnostic} />
        </div>
      ) : (
        <Preview
          diagnostic={state.diagnostic}
          awaiting={awaiting}
          onCheckout={() => {
            startedAt.current = Date.now();
            setAwaiting(true);
          }}
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
  awaiting,
  onCheckout,
  onPaid,
}: {
  diagnostic: Diagnostic;
  awaiting: boolean;
  onCheckout: () => void;
  onPaid: (d: Diagnostic) => void;
}) {
  const [redirecting, setRedirecting] = useState(false);
  const previewMode = !isCheckoutConfigured();
  const refunded = diagnostic.paymentStatus === "refunded";

  async function checkout() {
    setRedirecting(true);
    track("click_checkout");
    const url = buildCheckoutUrl({
      diagnosticId: diagnostic.id,
      name: diagnostic.name,
      email: diagnostic.email,
    });
    if (url) {
      rememberCheckout(diagnostic.id);
      onCheckout();
      window.location.href = url;
      return;
    }
    // Prévia sem Kiwify configurada: simula a aprovação para mostrar a entrega.
    await new Promise((r) => setTimeout(r, 700));
    const paid = await simulatePayment(diagnostic.id);
    if (paid) {
      onPaid(paid);
    } else {
      setRedirecting(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise motion-reduce:animate-none">
      {awaiting && !redirecting ? <AwaitingPayment /> : null}

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
            {refunded ? (
              <p className="mb-4 rounded-xl bg-white/10 px-3 py-2 text-center text-[13px] text-white/75">
                O pagamento deste Mapa foi estornado, então o relatório completo voltou a ficar bloqueado.
              </p>
            ) : null}
            <button type="button" onClick={checkout} disabled={redirecting} className={buttonFullClass}>
              {redirecting ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
                  {previewMode ? "Liberando…" : "Indo para o pagamento…"}
                </>
              ) : (
                <>
                  Desbloquear meu Mapa — {PRICE_LABEL}
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

/** Depois da compra, até o aviso da Kiwify chegar (briefing, seção 51: pagamento ainda não confirmado). */
function AwaitingPayment() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), FAST_WINDOW_MS);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div role="status" aria-live="polite" className="mt-4 flex gap-4 rounded-3xl border border-line bg-surface p-5">
      <span className="mt-0.5 size-6 shrink-0 animate-spin rounded-full border-[3px] border-brand-soft border-t-brand-strong motion-reduce:animate-none" />
      <div>
        <p className="text-[17px] font-semibold">
          {slow ? "Ainda esperando a confirmação do pagamento" : "Confirmando seu pagamento…"}
        </p>
        <p className="mt-1 leading-relaxed text-muted">
          {slow
            ? "PIX pode levar alguns minutos para confirmar. Pode deixar esta página aberta ou voltar por este mesmo link mais tarde: o Mapa completo aparece aqui assim que o pagamento for aprovado."
            : "Cartão e PIX costumam confirmar em poucos segundos. Esta página atualiza sozinha."}
        </p>
      </div>
    </div>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="pt-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Não conseguimos abrir seu diagnóstico agora.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">Confira sua conexão e tente de novo em instantes.</p>
      <div className="mt-8">
        <button type="button" onClick={onRetry} className={buttonClass}>
          Tentar de novo
          <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  );
}

function Missing() {
  return (
    <div className="pt-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Não encontramos este diagnóstico.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Confira se o link está completo. Se o problema continuar, refaça o quiz para gerar um novo Mapa.
      </p>
      <div className="mt-8">
        <Link href="/diagnostico" className={buttonClass}>
          Fazer meu Mapa
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
