"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GA4_ID, META_PIXEL_ID, ensureTrackers } from "@/lib/analytics";

/**
 * Carrega o Meta Pixel e o GA4 só quando os IDs estão configurados. As filas dos dois são
 * criadas antes (ensureTrackers), então eventos disparados enquanto os arquivos carregam não se
 * perdem. O GA4 já conta as trocas de página; o Pixel recebe um PageView a cada troca de rota.
 */
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    ensureTrackers();
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <>
      {META_PIXEL_ID ? <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" /> : null}
      {GA4_ID ? <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" /> : null}
    </>
  );
}
