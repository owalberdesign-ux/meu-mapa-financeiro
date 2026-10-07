/**
 * Pontos de evento do funil (briefing, seção 50). Vão para o Meta Pixel e o GA4 quando os IDs
 * estão configurados (NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_GA_ID); sem IDs, ficam só em
 * `window.__mmfEvents`.
 *
 * A compra é contada pelo site (evento Purchase do Pixel e purchase do GA4), uma vez por
 * diagnóstico. Por isso o Pixel não deve ser ativado também no produto da Kiwify: a compra
 * contaria duas vezes.
 */
import type { Diagnostic } from "@/types/diagnostic";

export type AnalyticsEvent =
  | "view_landing"
  | "start_quiz"
  | "quiz_step"
  | "complete_quiz"
  | "submit_lead"
  | "view_preview"
  | "click_checkout"
  | "purchase"
  | "view_report"
  | "download_pdf";

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    __mmfEvents?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const PRICE = { value: 37, currency: "BRL" } as const;
const SAFE_ID = /^[A-Za-z0-9-]+$/;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const META_PIXEL_ID = SAFE_ID.test(PIXEL_ID) ? PIXEL_ID : "";
export const GA4_ID = SAFE_ID.test(GA_ID) ? GA_ID : "";

/**
 * Cria as filas do Pixel e do GA antes de qualquer evento, para nada se perder enquanto os
 * scripts deles carregam (src/components/Analytics.tsx carrega os arquivos).
 */
export function ensureTrackers(): void {
  if (typeof window === "undefined") return;
  if (META_PIXEL_ID && !window.fbq) {
    type Fbq = ((...args: unknown[]) => void) & { queue: unknown[]; callMethod?: (...a: unknown[]) => void; push?: unknown; loaded?: boolean; version?: string };
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    (window as unknown as { _fbq?: Fbq })._fbq = fbq;
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }
  if (GA4_ID && !window.gtag) {
    const w = window as unknown as { dataLayer: unknown[] };
    w.dataLayer = w.dataLayer ?? [];
    window.gtag = function () {
      // gtag.js espera o objeto `arguments`, não um array.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }
}

/** Nomes padrão de cada plataforma; o resto vai como evento personalizado. */
const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  submit_lead: "Lead",
  click_checkout: "InitiateCheckout",
};
const GA_NAME: Partial<Record<AnalyticsEvent, string>> = {
  submit_lead: "generate_lead",
  click_checkout: "begin_checkout",
};

function log(event: string, params: Params) {
  window.__mmfEvents = window.__mmfEvents ?? [];
  window.__mmfEvents.push({ event, ...params });
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, params);
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  ensureTrackers();
  log(event, params);
  const money = event === "click_checkout" ? PRICE : {};
  window.gtag?.("event", GA_NAME[event] ?? event, { ...params, ...money });
  const standard = META_STANDARD[event];
  if (standard) window.fbq?.("track", standard, money);
  else window.fbq?.("trackCustom", event, params);
}

/**
 * Compra confirmada: uma vez por diagnóstico, só nas primeiras 24 horas depois do pagamento
 * (abrir o relatório dias depois, ou em outro aparelho, não conta de novo). A prévia não conta.
 */
export function trackPurchaseOnce(diagnostic: Diagnostic): void {
  if (typeof window === "undefined") return;
  if (diagnostic.paymentStatus !== "paid" || diagnostic.paymentId === "previa") return;
  const paidAt = diagnostic.paidAt ? Date.parse(diagnostic.paidAt) : NaN;
  if (!(Date.now() - paidAt < 24 * 3600_000)) return;
  const key = `mmf:purchase:${diagnostic.id}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    // Sem armazenamento: segue e conta nesta visita.
  }
  ensureTrackers();
  log("purchase", { transaction_id: diagnostic.id });
  window.gtag?.("event", "purchase", { transaction_id: diagnostic.id, ...PRICE });
  window.fbq?.("track", "Purchase", PRICE, { eventID: diagnostic.id });
}
