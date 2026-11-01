"use client";

import { clsx } from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";
import type { SubmissionState } from "@/lib/submissions/types";

export function describedBy(name: string, error: string | undefined) {
  return error ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};
}

export function Optional() {
  return <span className="ms-1 text-xs font-medium text-paper/45">اختياري</span>;
}

export function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="mt-2 text-sm font-medium text-coral">
      {error}
    </p>
  );
}

export function Field({
  name,
  label,
  required = false,
  error,
  hidden = false,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div hidden={hidden}>
      <label htmlFor={name} className="partners-label">
        {label}
        {required ? null : <Optional />}
      </label>
      <div className="mt-2">{children}</div>
      <FieldError name={name} error={error} />
    </div>
  );
}

/** Success panel that takes focus so screen readers announce it. */
export function SuccessPanel({ children }: { children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <div className="partners-form-panel" role="status">
      <h3 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
        وصلنا طلبك
      </h3>
      <p className="mt-3 leading-relaxed text-paper/75">{children}</p>
    </div>
  );
}

export function StatusMessage({ state }: { state: SubmissionState }) {
  let text: ReactNode = null;
  let mailto: string | null = null;
  if (state.status === "error-verify") {
    text = "تعذّر التحقق من الطلب. أعد المحاولة، أو أرسله عبر البريد.";
    mailto = state.mailto;
  } else if (state.status === "rate-limited") {
    text = (
      <>
        أرسلت عدة طلبات خلال وقت قصير. حاول بعد ساعة أو راسلنا على{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="underline">
          {CONTACT_EMAIL}
        </a>
        .
      </>
    );
  } else if (state.status === "error-send") {
    text = "تعذّر إرسال الطلب الآن. يمكنك إرساله عبر البريد مباشرة وسيصلنا كاملًا.";
    mailto = state.mailto;
  }

  return (
    <div aria-live="polite" className={clsx(text && "partners-alert mt-6")}>
      {text ? <p>{text}</p> : null}
      {mailto ? (
        <a href={mailto} className="partners-alert-action">
          أرسل عبر البريد
        </a>
      ) : null}
    </div>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div className="partners-hp" aria-hidden="true">
      <label htmlFor="website">الموقع</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
