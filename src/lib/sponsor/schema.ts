import { z } from "zod";
import { PARTNERSHIP_FORMS, SECTORS, TRACKS, type PartnershipFormSlug } from "@/lib/content";
import { normalizeSaudiPhone } from "./phone";
import type { SponsorField, SponsorFormValues } from "./types";

export const FIELD_LABELS: Record<SponsorField, string> = {
  company: "اسم الشركة",
  email: "البريد الإلكتروني",
  contactName: "اسم ممثل الشركة",
  role: "المنصب",
  phone: "رقم الجوال",
  sector: "القطاع",
  interests: "أشكال الشراكة التي تهمّكم",
  track: "مسار مفضّل",
  message: "رسالة",
};

const MSG = {
  company: "اكتب اسم الشركة",
  email: "اكتب بريدًا إلكترونيًا صحيحًا",
  phone: "اكتب رقم جوال سعودي صحيح مثل 0512345678",
  tooLong: "النص أطول من المسموح",
  // Only reachable by tampering with the form (the UI offers fixed lists).
  choice: "اختر قيمة من القائمة",
} as const;

const TEXT_FIELDS = ["company", "email", "contactName", "role", "phone", "sector", "track", "message"] as const;

const slugs = PARTNERSHIP_FORMS.map((form) => form.slug) as [PartnershipFormSlug, ...PartnershipFormSlug[]];
const trackNumbers = TRACKS.map((track) => track.number) as [string, ...string[]];

const optionalText = (max: number) => z.string().max(max, { error: MSG.tooLong }).optional();

const sponsorSchema = z.object({
  company: z
    .string({ error: MSG.company })
    .min(2, { error: MSG.company })
    .max(120, { error: MSG.tooLong }),
  email: z
    .string({ error: MSG.email })
    .max(200, { error: MSG.tooLong })
    .pipe(z.email({ error: MSG.email })),
  contactName: optionalText(120),
  role: optionalText(120),
  phone: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (value === undefined) return undefined;
      const normalized = normalizeSaudiPhone(value);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: MSG.phone });
        return z.NEVER;
      }
      return normalized;
    }),
  sector: z.enum(SECTORS, { error: MSG.choice }).optional(),
  interests: z.array(z.enum(slugs, { error: MSG.choice })),
  track: z.enum(trackNumbers, { error: MSG.choice }).optional(),
  message: optionalText(2000),
});

export type SponsorRequest = z.infer<typeof sponsorSchema>;

/** Trimmed form input; empty fields are left out. */
export function readSponsorValues(formData: FormData): SponsorFormValues {
  const values: SponsorFormValues = {};
  for (const key of TEXT_FIELDS) {
    const raw = formData.get(key);
    const text = typeof raw === "string" ? raw.trim() : "";
    if (text) values[key] = text;
  }
  const interests = [
    ...new Set(
      formData
        .getAll("interests")
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
        .map((v) => v.trim()),
    ),
  ];
  if (interests.length) values.interests = interests;
  return values;
}

export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get("website");
  return typeof value === "string" && value.trim() !== "";
}

export function parseSponsorForm(
  formData: FormData,
):
  | { ok: true; data: SponsorRequest }
  | { ok: false; fieldErrors: Partial<Record<SponsorField, string>>; values: SponsorFormValues } {
  const values = readSponsorValues(formData);
  const result = sponsorSchema.safeParse({
    ...values,
    email: values.email?.toLowerCase(),
    interests: values.interests ?? [],
  });
  if (result.success) {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, v]) => v !== undefined),
    ) as SponsorRequest;
    return { ok: true, data };
  }

  const fieldErrors: Partial<Record<SponsorField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as SponsorField | undefined;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { ok: false, fieldErrors, values };
}
