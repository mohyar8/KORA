"use client";

import { useState } from "react";
import { submitSpeakerRequest } from "@/app/speakers/actions";
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
import { useSubmission } from "@/components/forms/useSubmission";
import { asList, asText } from "@/components/forms/values";
import { SPEAKER_FORMATS, TRACKS } from "@/lib/content";
import { speakerForm } from "@/lib/speakers/form";
import { readSpeakerValues, type SpeakerMode } from "@/lib/speakers/schema";

const LABELS: Record<SpeakerMode, { name: string; role: string; bio: string; contact: string }> = {
  self: {
    name: "اسمك",
    role: "منصبك والجهة",
    bio: "نبذة عنك",
    contact: "أضف بريدًا أو رقم جوال للتواصل",
  },
  nominate: {
    name: "اسم المتحدث",
    role: "منصبه والجهة",
    bio: "لماذا ترشّحه؟",
    contact: "أضف بريد المتحدث أو جواله أو رابط حسابه",
  },
};

export function SpeakerForm() {
  const { state, formAction, pending, onSubmit } = useSubmission(
    submitSpeakerRequest,
    readSpeakerValues,
    speakerForm.buildMailto,
  );
  // Lives outside the remounting <form>, so switching modes keeps typed input.
  const [mode, setMode] = useState<SpeakerMode>("self");

  if (state.status === "success") {
    return (
      <SuccessPanel>
        {state.submitted?.mode === "nominate"
          ? "شكرًا لترشيحك. سيراجع فريق البرنامج الترشيح ويتواصل مع المتحدث."
          : "شكرًا لاهتمامك بالمشاركة في «كورة». سيتواصل معك فريق البرنامج قريبًا."}
      </SuccessPanel>
    );
  }

  const values = "values" in state ? state.values : {};
  const errors = state.status === "invalid" ? state.fieldErrors : {};
  const labels = LABELS[mode];
  const nominating = mode === "nominate";

  return (
    <form
      key={state.nonce}
      action={formAction}
      onSubmit={onSubmit}
      className="partners-form-panel"
    >
      <fieldset>
        <legend className="sr-only">طريقة المشاركة</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["self", "أقدّم نفسي"],
              ["nominate", "أرشّح متحدثًا"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="partners-chip">
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="sr-only"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="name" label={labels.name} required error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete={nominating ? "off" : "name"}
            defaultValue={asText(values.name)}
            {...describedBy("name", errors.name)}
            className="partners-input"
          />
        </Field>
        <Field name="role" label={labels.role} required error={errors.role}>
          <input
            id="role"
            name="role"
            type="text"
            required
            defaultValue={asText(values.role)}
            {...describedBy("role", errors.role)}
            className="partners-input"
          />
        </Field>
      </div>

      <fieldset className="mt-6">
        <legend className="partners-label">طريقة التواصل</legend>
        <p className="mt-1 text-sm text-paper/55">{labels.contact}</p>
        <div className="mt-3 grid gap-5 md:grid-cols-2">
          <Field name="email" label="البريد الإلكتروني" required error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete={nominating ? "off" : "email"}
              defaultValue={asText(values.email)}
              {...describedBy("email", errors.email)}
              className="partners-input"
            />
          </Field>
          <Field name="phone" label="رقم الجوال" required error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              autoComplete={nominating ? "off" : "tel"}
              placeholder="+966 5X XXX XXXX"
              defaultValue={asText(values.phone)}
              {...describedBy("phone", errors.phone)}
              className="partners-input text-right"
            />
          </Field>
          <div className="md:col-span-2">
            <Field name="link" label="رابط حساب أو موقع" required={nominating} error={errors.link}>
              <input
                id="link"
                name="link"
                type="url"
                dir="ltr"
                placeholder="https://"
                defaultValue={asText(values.link)}
                {...describedBy("link", errors.link)}
                className="partners-input text-right"
              />
            </Field>
          </div>
        </div>
      </fieldset>

      <div className="mt-6">
        <Field name="bio" label={labels.bio} required error={errors.bio}>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            required
            defaultValue={asText(values.bio)}
            {...describedBy("bio", errors.bio)}
            className="partners-input resize-y"
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="topic" label="موضوع الجلسة المقترح" error={errors.topic}>
          <input
            id="topic"
            name="topic"
            type="text"
            defaultValue={asText(values.topic)}
            {...describedBy("topic", errors.topic)}
            className="partners-input"
          />
        </Field>
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
      </div>

      <fieldset className="mt-6" {...describedBy("formats", errors.formats)}>
        <legend className="partners-label">
          نوع المشاركة <Optional />
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SPEAKER_FORMATS.map((format) => (
            <label key={format.slug} className="partners-chip">
              <input
                type="checkbox"
                name="formats"
                value={format.slug}
                defaultChecked={asList(values.formats).includes(format.slug)}
                className="sr-only"
              />
              <span>{format.title}</span>
            </label>
          ))}
        </div>
        <FieldError name="formats" error={errors.formats} />
      </fieldset>

      {/* Kept mounted in both modes so input survives switching; ignored for self. */}
      <div hidden={!nominating} className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="nominatorName" label="اسمك" error={errors.nominatorName}>
          <input
            id="nominatorName"
            name="nominatorName"
            type="text"
            autoComplete="name"
            defaultValue={asText(values.nominatorName)}
            {...describedBy("nominatorName", errors.nominatorName)}
            className="partners-input"
          />
        </Field>
        <Field name="nominatorContact" label="بريدك أو جوالك" error={errors.nominatorContact}>
          <input
            id="nominatorContact"
            name="nominatorContact"
            type="text"
            dir="ltr"
            defaultValue={asText(values.nominatorContact)}
            {...describedBy("nominatorContact", errors.nominatorContact)}
            className="partners-input text-right"
          />
        </Field>
      </div>

      <Honeypot />

      <div className="mt-6">
        <TurnstileWidget resetKey={state.nonce} />
      </div>

      <StatusMessage state={state} />

      <button type="submit" disabled={pending} className="partners-submit kora-cut mt-6">
        {pending ? "جارٍ الإرسال…" : "أرسل"}
      </button>
      <p className="mt-4 text-sm leading-relaxed text-paper/55">
        بإرسال النموذج توافق على تواصل فريق كورة بخصوص المشاركة، ولن نشارك البيانات مع أي جهة.
      </p>
    </form>
  );
}
