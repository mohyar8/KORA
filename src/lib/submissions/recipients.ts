import { CONTACT_EMAIL } from "@/lib/constants";

/**
 * The first non-empty comma-separated list among `candidates`, else the
 * official KORA inbox. Lets each form route to its own team with a fallback.
 */
export function notifyRecipients(...candidates: (string | undefined)[]): string[] {
  for (const raw of candidates) {
    const list = (raw ?? "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (list.length) return list;
  }
  return [CONTACT_EMAIL];
}
