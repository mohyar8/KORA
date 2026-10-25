import { describeSponsorValues } from "./format";
import type { SponsorFormValues } from "./types";

/** A ready-to-send email holding the visitor's input — the last-resort channel. */
export function buildMailto(values: SponsorFormValues, to: string): string {
  const subject = values.company ? `طلب شراكة — ${values.company}` : "طلب شراكة";
  const body = describeSponsorValues(values).join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
