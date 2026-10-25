import { PARTNERSHIP_FORMS, TRACKS } from "@/lib/content";
import { FIELD_LABELS } from "./schema";
import type { SponsorField, SponsorFormValues } from "./types";

const ORDER: SponsorField[] = [
  "company",
  "contactName",
  "role",
  "email",
  "phone",
  "sector",
  "interests",
  "track",
  "message",
];

/** `التسمية: القيمة` lines for every filled field, with slugs/numbers shown as titles. */
export function describeSponsorValues(values: SponsorFormValues): string[] {
  const lines: string[] = [];
  for (const field of ORDER) {
    let text: string | undefined;
    if (field === "interests") {
      const titles = (values.interests ?? []).map(
        (slug) => PARTNERSHIP_FORMS.find((form) => form.slug === slug)?.title ?? slug,
      );
      text = titles.length ? titles.join("، ") : undefined;
    } else if (field === "track") {
      const track = TRACKS.find((t) => t.number === values.track);
      text = track ? `${track.number} ${track.title}` : values.track;
    } else {
      text = values[field];
    }
    if (text) lines.push(`${FIELD_LABELS[field]}: ${text}`);
  }
  return lines;
}
