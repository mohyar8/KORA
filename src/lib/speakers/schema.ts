import { z } from "zod";
import { SPEAKER_FORMATS, TRACKS, type SpeakerFormatSlug } from "@/lib/content";
import { normalizeAnyPhone } from "@/lib/sponsor/phone";
import type { FieldErrors, FormValues } from "@/lib/submissions/types";

export type SpeakerMode = "self" | "nominate";

/** Labels for the team email and the mailto fallback (wording is mode-neutral). */
export const SPEAKER_LABELS: Record<string, string> = {
  mode: "الوضع",
  name: "اسم المتحدث",
  role: "المنصب والجهة",
  bio: "نبذة",
  email: "البريد الإلكتروني",
  phone: "رقم الجوال",
  link: "رابط حساب أو موقع",
  topic: "موضوع الجلسة المقترح",
  track: "مسار مفضّل",
  formats: "نوع المشاركة",
  nominatorName: "اسم المُرشِّح",
  nominatorContact: "تواصل المُرشِّح",
};

const MSG = {
  name: "اكتب الاسم",
  role: "اكتب المنصب والجهة",
  bio: "اكتب نبذة قصيرة (10 أحرف على الأقل)",
  email: "اكتب بريدًا إلكترونيًا صحيحًا",
  phone: "اكتب رقم جوال صحيحًا، مثل 0512345678 أو رقمًا دوليًا يبدأ بـ +",
  link: "اكتب رابطًا صحيحًا يبدأ بـ https://",
  contactSelf: "أضف بريدًا أو رقم جوال للتواصل",
  contactNominate: "أضف بريد المتحدث أو جواله أو رابط حسابه",
  tooLong: "النص أطول من المسموح",
  choice: "اختر قيمة من القائمة",
} as const;

const TEXT_FIELDS = [
  "mode",
  "name",
  "role",
  "bio",
  "email",
  "phone",
  "link",
  "topic",
  "track",
  "nominatorName",
  "nominatorContact",
] as const;

const formatSlugs = SPEAKER_FORMATS.map((f) => f.slug) as [SpeakerFormatSlug, ...SpeakerFormatSlug[]];
const trackNumbers = TRACKS.map((t) => t.number) as [string, ...string[]];

const required = (min: number, max: number, message: string) =>
  z.string({ error: message }).min(min, { error: message }).max(max, { error: MSG.tooLong });
const optionalText = (max: number) => z.string().max(max, { error: MSG.tooLong }).optional();

const speakerSchema = z
  .object({
    mode: z.enum(["self", "nominate"], { error: MSG.choice }),
    name: required(2, 120, MSG.name),
    role: required(2, 160, MSG.role),
    bio: required(10, 2000, MSG.bio),
    email: z
      .string()
      .max(200, { error: MSG.tooLong })
      .pipe(z.email({ error: MSG.email }))
      .optional(),
    phone: z
      .string()
      .optional()
      .transform((value, ctx) => {
        if (value === undefined) return undefined;
        const normalized = normalizeAnyPhone(value);
        if (!normalized) {
          ctx.addIssue({ code: "custom", message: MSG.phone });
          return z.NEVER;
        }
        return normalized;
      }),
    link: z
      .string()
      .max(300, { error: MSG.tooLong })
      .pipe(z.url({ protocol: /^https?$/, error: MSG.link }))
      .optional(),
    topic: optionalText(200),
    track: z.enum(trackNumbers, { error: MSG.choice }).optional(),
    formats: z.array(z.enum(formatSlugs, { error: MSG.choice })),
    nominatorName: optionalText(120),
    nominatorContact: optionalText(200),
  })
  .superRefine((data, ctx) => {
    const reachable =
      data.mode === "self" ? data.email || data.phone : data.email || data.phone || data.link;
    if (!reachable) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: data.mode === "self" ? MSG.contactSelf : MSG.contactNominate,
      });
    }
  });

export type SpeakerRequest = z.infer<typeof speakerSchema>;

/** Trimmed form input; empty fields are left out. */
export function readSpeakerValues(formData: FormData): FormValues {
  const values: FormValues = {};
  for (const key of TEXT_FIELDS) {
    const raw = formData.get(key);
    const text = typeof raw === "string" ? raw.trim() : "";
    if (text) values[key] = text;
  }
  const formats = [
    ...new Set(
      formData
        .getAll("formats")
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
        .map((v) => v.trim()),
    ),
  ];
  if (formats.length) values.formats = formats;
  return values;
}

export function parseSpeakerForm(
  formData: FormData,
):
  | { ok: true; data: SpeakerRequest }
  | { ok: false; fieldErrors: FieldErrors; values: FormValues } {
  const values = readSpeakerValues(formData);
  const mode = values.mode ?? "self";
  const self = mode === "self";
  const result = speakerSchema.safeParse({
    ...values,
    mode,
    email: typeof values.email === "string" ? values.email.toLowerCase() : undefined,
    formats: values.formats ?? [],
    // A self-applicant has no nominator, even if hidden fields kept old input.
    nominatorName: self ? undefined : values.nominatorName,
    nominatorContact: self ? undefined : values.nominatorContact,
  });
  if (result.success) {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, v]) => v !== undefined),
    ) as SpeakerRequest;
    return { ok: true, data };
  }

  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { ok: false, fieldErrors, values };
}
