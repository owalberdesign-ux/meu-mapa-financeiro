/**
 * Pontos de evento do funil (briefing, seção 50). Hoje vão para o dataLayer;
 * quando Meta Pixel / GA forem instalados, `fbq` e `gtag` passam a receber os
 * mesmos eventos sem mudar os componentes.
 */
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
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, params);
  }
}
