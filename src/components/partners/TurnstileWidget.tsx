"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: { sitekey: string; language?: string; theme?: "light" | "dark" | "auto" },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile, rendered explicitly so it also works after client-side
 * navigation. It injects the hidden `cf-turnstile-response` field into the
 * surrounding form. Bump `resetKey` to get a fresh token after a failed submit.
 */
export function TurnstileWidget({ resetKey }: { resetKey: number }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !SITE_KEY || !container.current || !window.turnstile) return;
    const api = window.turnstile;
    widgetId.current = api.render(container.current, {
      sitekey: SITE_KEY,
      language: "ar",
      theme: "dark",
    });
    return () => {
      if (widgetId.current) api.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (resetKey > 0 && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  // Without a key the server rejects the submit and the visitor gets the email fallback.
  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={container} className="min-h-[65px]" />
    </>
  );
}
