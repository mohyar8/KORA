"use client";

import { submitSponsorRequest } from "@/app/partners/actions";
import {
  describedBy,
  Field,
  FieldError,
  Honeypot,
  Optional,
  StatusMessage,
  SuccessPanel,
} from "@/components/forms/FormParts";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { asList, asText } from "@/components/forms/values";
import { useSubmission } from "@/components/forms/useSubmission";
import { PARTNERSHIP_FORMS, SECTORS, TRACKS } from "@/lib/content";
import { buildMailto } from "@/lib/sponsor/mailto";
import { readSponsorValues } from "@/lib/sponsor/schema";

export function SponsorForm() {
  const { state, formAction, pending, onSubmit } = useSubmission(
    submitSponsorRequest,
    readSponsorValues,
    buildMailto,
  );

  if (state.status === "success") {
    return (
      <SuccessPanel>
        شكرًا لاهتمامك بـ«كورة». سيتواصل معك فريق الشراكات قريبًا على{" "}
        <span dir="ltr" className="font-semibold text-paper">
          {state.email}
        </span>
        .
      </SuccessPanel>
    );
  }

  const values = "values" in state ? state.values : {};
  const errors = state.status === "invalid" ? state.fieldErrors : {};

  return (
    <form
      key={state.nonce}
      action={formAction}
      onSubmit={onSubmit}
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
            defaultValue={asText(values.company)}
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
            defaultValue={asText(values.email)}
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
            defaultValue={asText(values.contactName)}
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
            defaultValue={asText(values.role)}
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
            defaultValue={asText(values.phone)}
            {...describedBy("phone", errors.phone)}
            className="partners-input text-right"
          />
        </Field>
        <Field name="sector" label="القطاع" error={errors.sector}>
          <select
            id="sector"
            name="sector"
            defaultValue={asText(values.sector) ?? ""}
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
                defaultChecked={asList(values.interests).includes(form.slug)}
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
            defaultValue={asText(values.track) ?? ""}
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
              defaultValue={asText(values.message)}
              {...describedBy("message", errors.message)}
              className="partners-input resize-y"
            />
          </Field>
        </div>
      </div>

      <Honeypot />

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
