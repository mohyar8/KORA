"use client";

import { clsx } from "clsx";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { submitSponsorRequest } from "@/app/partners/actions";
import { TurnstileWidget } from "@/components/partners/TurnstileWidget";
import { CONTACT_EMAIL } from "@/lib/constants";
import { PARTNERSHIP_FORMS, SECTORS, TRACKS } from "@/lib/content";
import { buildMailto } from "@/lib/sponsor/mailto";
import { readSponsorValues } from "@/lib/sponsor/schema";
import type { SponsorField, SponsorFormState } from "@/lib/sponsor/types";

/** `nonce` changes on every result so the form (and its single-use Turnstile token) remounts. */
type FormState = SponsorFormState & { nonce: number };

const initialState: FormState = { status: "idle", nonce: 0 };

async function submit(prev: FormState, formData: FormData): Promise<FormState> {
  const nonce = prev.nonce + 1;
  try {
    return { ...(await submitSponsorRequest(prev, formData)), nonce };
  } catch {
    // Network failure or a stale action after a redeploy: hand over the email route.
    const values = readSponsorValues(formData);
    return { status: "error-send", mailto: buildMailto(values, CONTACT_EMAIL), values, nonce };
  }
}

export function SponsorForm() {
  const [state, formAction, pending] = useActionState(submit, initialState);
  const successHeading = useRef<HTMLHeadingElement>(null);
  // `pending` only flips on the next render, so a fast double click could
  // still post twice; this blocks a second submit until a result arrives.
  const submittedFor = useRef(-1);

  useEffect(() => {
    if (state.status === "success") successHeading.current?.focus();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div className="partners-form-panel" role="status">
        <h3 ref={successHeading} tabIndex={-1} className="text-2xl font-bold outline-none">
          وصلنا طلبك
        </h3>
        <p className="mt-3 leading-relaxed text-paper/75">
          شكرًا لاهتمامك بـ«كورة». سيتواصل معك فريق الشراكات قريبًا على{" "}
          <span dir="ltr" className="font-semibold text-paper">
            {state.email}
          </span>
          .
        </p>
      </div>
    );
  }

  const values = "values" in state ? state.values : {};
  const errors: Partial<Record<SponsorField, string>> =
    state.status === "invalid" ? state.fieldErrors : {};

  return (
    <form
      key={state.nonce}
      action={formAction}
      onSubmit={(event) => {
        if (submittedFor.current === state.nonce) event.preventDefault();
        else submittedFor.current = state.nonce;
      }}
      className="partners-form-panel"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="company" label="اسم الشركة" required error={errors.company}>
          <input
            id="company"
            name="company"
            type="text"
            required
            autoComplete="organization"
            defaultValue={values.company}
            {...describedBy("company", errors.company)}
            className="partners-input"
          />
        </Field>
        <Field name="email" label="البريد الإلكتروني" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            dir="ltr"
            autoComplete="email"
            defaultValue={values.email}
            {...describedBy("email", errors.email)}
            className="partners-input"
          />
        </Field>
        <Field name="contactName" label="اسم ممثل الشركة" error={errors.contactName}>
          <input
            id="contactName"
            name="contactName"
            type="text"
            autoComplete="name"
            defaultValue={values.contactName}
            {...describedBy("contactName", errors.contactName)}
            className="partners-input"
          />
        </Field>
        <Field name="role" label="المنصب" error={errors.role}>
          <input
            id="role"
            name="role"
            type="text"
            autoComplete="organization-title"
            defaultValue={values.role}
            {...describedBy("role", errors.role)}
            className="partners-input"
          />
        </Field>
        <Field name="phone" label="رقم الجوال" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="05XXXXXXXX"
            defaultValue={values.phone}
            {...describedBy("phone", errors.phone)}
            className="partners-input text-right"
          />
        </Field>
        <Field name="sector" label="القطاع" error={errors.sector}>
          <select
            id="sector"
            name="sector"
            defaultValue={values.sector ?? ""}
            {...describedBy("sector", errors.sector)}
            className="partners-input"
          >
            <option value="">اختر القطاع</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="mt-6" {...describedBy("interests", errors.interests)}>
        <legend className="partners-label">
          أشكال الشراكة التي تهمّكم <Optional />
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PARTNERSHIP_FORMS.map((form) => (
            <label key={form.slug} className="partners-chip">
              <input
                type="checkbox"
                name="interests"
                value={form.slug}
                defaultChecked={values.interests?.includes(form.slug)}
                className="sr-only"
              />
              <span>{form.title}</span>
            </label>
          ))}
        </div>
        <FieldError name="interests" error={errors.interests} />
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="track" label="مسار مفضّل" error={errors.track}>
          <select
            id="track"
            name="track"
            defaultValue={values.track ?? ""}
            {...describedBy("track", errors.track)}
            className="partners-input"
          >
            <option value="">بدون تفضيل</option>
            {TRACKS.map((track) => (
              <option key={track.number} value={track.number}>
                {track.title}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field name="message" label="رسالة" error={errors.message}>
            <textarea
              id="message"
              name="message"
              rows={4}
              defaultValue={values.message}
              {...describedBy("message", errors.message)}
              className="partners-input resize-y"
            />
          </Field>
        </div>
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="partners-hp" aria-hidden="true">
        <label htmlFor="website">الموقع</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6">
        <TurnstileWidget resetKey={state.nonce} />
      </div>

      <StatusMessage state={state} />

      <button type="submit" disabled={pending} className="partners-submit kora-cut mt-6">
        {pending ? "جارٍ الإرسال…" : "أرسل الطلب"}
      </button>
      <p className="mt-4 text-sm leading-relaxed text-paper/55">
        بإرسال الطلب توافق على تواصل فريق كورة معك بخصوص الشراكة، ولن نشارك بياناتك مع أي جهة.
      </p>
    </form>
  );
}

function describedBy(name: SponsorField, error: string | undefined) {
  return error ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};
}

function Optional() {
  return <span className="ms-1 text-xs font-medium text-paper/45">اختياري</span>;
}

function FieldError({ name, error }: { name: SponsorField; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="mt-2 text-sm font-medium text-coral">
      {error}
    </p>
  );
}

function Field({
  name,
  label,
  required = false,
  error,
  children,
}: {
  name: SponsorField;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="partners-label">
        {label}
        {required ? null : <Optional />}
      </label>
      <div className="mt-2">{children}</div>
      <FieldError name={name} error={error} />
    </div>
  );
}

function StatusMessage({ state }: { state: FormState }) {
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
