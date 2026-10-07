"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/Icon";
import { Logo, buttonClass } from "@/components/ui";
import { lastCheckout } from "@/lib/diagnostic-store";

const noSubscribe = () => () => {};

export function BackFromCheckout() {
  const router = useRouter();
  // No servidor ainda não dá para saber (null); no navegador, "" quando não há compra recente.
  const id = useSyncExternalStore(noSubscribe, () => lastCheckout() ?? "", () => null);
  const lost = id === "";

  useEffect(() => {
    if (id) router.replace(`/resultado/${id}?compra=1`);
  }, [id, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <header className="py-4">
        <Logo />
      </header>
      {lost ? (
        <div className="pt-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
            <Icon name="good" className="size-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Recebemos o seu pedido.</h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
            Para ver o seu Mapa completo, abra este site no mesmo celular ou computador em que você
            respondeu o quiz. Ele aparece liberado assim que o pagamento for aprovado.
          </p>
          <div className="mt-8">
            <Link href="/" className={buttonClass}>
              Ir para o início
              <Icon name="arrowRight" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid place-items-center pt-24" role="status" aria-live="polite">
          <span className="size-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand-strong motion-reduce:animate-none" />
          <p className="mt-5 text-lg font-semibold">Voltando para o seu Mapa…</p>
        </div>
      )}
    </div>
  );
}
