"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

/**
 * Botão fixo no rodapé do celular. Aparece depois que o CTA do topo sai da
 * tela e some quando a oferta (que já tem botão) está visível.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const offer = document.getElementById("oferta");
    if (!hero || !offer) return;
    const seen = { hero: true, offer: false };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) seen.hero = entry.isIntersecting || entry.boundingClientRect.top > 0;
        if (entry.target === offer) seen.offer = entry.isIntersecting;
      }
      setVisible(!seen.hero && !seen.offer);
    });
    observer.observe(hero);
    observer.observe(offer);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <Link
        href="/diagnostico"
        tabIndex={visible ? 0 : -1}
        className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand-strong text-[15px] font-semibold uppercase tracking-wide text-white"
      >
        Começar grátis
        <span className="font-normal normal-case tracking-normal text-white/75">· 3 min</span>
        <Icon name="arrowRight" className="size-5" />
      </Link>
    </div>
  );
}
