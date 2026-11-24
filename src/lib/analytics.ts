/// <reference types="vite/client" />

/**
 * Optional Google Analytics 4 (gtag.js) loader for the marketing site.
 *
 * Loads only when the build-time env `VITE_GA_MEASUREMENT_ID` is set to a GA4 id (G-XXXXXXXX).
 * With the variable unset, nothing is loaded and every call below is a no-op.
 * No consent banner exists, so ad personalisation signals stay off.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID ?? "").trim();
const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

export function initAnalytics(): void {
  if (typeof window === "undefined" || !GA4_ID_PATTERN.test(MEASUREMENT_ID)) return;
  try {
    const layer = (window.dataLayer = window.dataLayer ?? []);
    // gtag.js expects the raw `arguments` object, so this must stay a plain function.
    window.gtag = function gtag() {
      layer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  } catch {
    // Analytics must never break the page.
  }
}

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  try {
    window.gtag?.("event", name, params);
  } catch {
    // Ignore analytics failures.
  }
}
