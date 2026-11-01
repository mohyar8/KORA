"use client";

import { useEffect, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5.25" width="18" height="13.5" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.2 7.2 12 12.6l7.8-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The footer's mail icon. `mailto:` does nothing on machines without a mail
 * app, so a click also shows the address and copies it when allowed.
 */
export function MailLink({ className }: { className: string }) {
  const [note, setNote] = useState<"copied" | "shown" | null>(null);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(null), 4000);
    return () => window.clearTimeout(timer);
  }, [note]);

  return (
    <span className="site-footer-mail">
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        aria-label={`البريد: ${CONTACT_EMAIL}`}
        title={CONTACT_EMAIL}
        className={className}
        data-accent="coral"
        onClick={() => {
          setNote("shown");
          navigator.clipboard?.writeText(CONTACT_EMAIL).then(
            () => setNote("copied"),
            () => undefined,
          );
        }}
      >
        <MailIcon />
      </a>
      <span role="status" className="site-footer-mail-note" data-show={note !== null}>
        {note ? (
          <>
            {note === "copied" ? "نُسخ البريد" : "البريد"} <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
          </>
        ) : null}
      </span>
    </span>
  );
}
