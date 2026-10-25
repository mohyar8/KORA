import { SPEAKER_FORMATS, TRACKS } from "@/lib/content";
import type { SubmissionForm } from "@/lib/submissions/process";
import type { FormValues } from "@/lib/submissions/types";
import { parseSpeakerForm, readSpeakerValues, SPEAKER_LABELS, type SpeakerRequest } from "./schema";

const ORDER = [
  "mode",
  "name",
  "role",
  "email",
  "phone",
  "link",
  "bio",
  "topic",
  "track",
  "formats",
  "nominatorName",
  "nominatorContact",
] as const;

/** `التسمية: القيمة` lines for every filled field, with slugs/numbers shown as titles. */
export function describeSpeakerValues(values: FormValues): string[] {
  const lines: string[] = [];
  for (const field of ORDER) {
    const value = values[field];
    let text: string | undefined;
    if (field === "mode") {
      text = value === "nominate" ? "ترشيح" : "تقديم ذاتي";
    } else if (field === "formats") {
      const slugs = Array.isArray(value) ? value : [];
      text =
        slugs.map((s) => SPEAKER_FORMATS.find((f) => f.slug === s)?.title ?? s).join("، ") ||
        undefined;
    } else if (field === "track") {
      const track = TRACKS.find((t) => t.number === value);
      text = track ? `${track.number} ${track.title}` : (value as string | undefined);
    } else {
      text = typeof value === "string" ? value : undefined;
    }
    if (text) lines.push(`${SPEAKER_LABELS[field]}: ${text}`);
  }
  return lines;
}

export function speakerSubject(mode: unknown, name: unknown): string {
  const kind = mode === "nominate" ? "ترشيح متحدث" : "طلب متحدث";
  return typeof name === "string" && name ? `${kind} — ${name}` : kind;
}

export const speakerForm: SubmissionForm<SpeakerRequest> = {
  parse: parseSpeakerForm,
  readValues: readSpeakerValues,
  buildMailto(values, to) {
    const subject = speakerSubject(values.mode, values.name);
    const body = describeSpeakerValues(values).join("\n");
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },
};
