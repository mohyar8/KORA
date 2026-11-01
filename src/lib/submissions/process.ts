import type { FieldErrors, FormValues, SubmissionState } from "./types";

export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 } as const;

/** How one form reads, validates and hands over its input. */
export interface SubmissionForm<T> {
  parse(formData: FormData):
    | { ok: true; data: T }
    | { ok: false; fieldErrors: FieldErrors; values: FormValues };
  readValues(formData: FormData): FormValues;
  /** The last-resort email holding the visitor's input. */
  buildMailto(values: FormValues, to: string): string;
  /** Shown back to the visitor on success, when the form has one. */
  successEmail?(data: T): string | undefined;
}

/** Everything the pipeline touches outside itself, injected so it can be tested. */
export interface SubmissionDeps<T> {
  verifyCaptcha(token: string | null): Promise<boolean>;
  ipHash: string | null;
  countRecent(ipHash: string, since: Date): Promise<number>;
  /** Stores the submission and returns its id. */
  save(data: T, ipHash: string | null): Promise<string>;
  markNotified(id: string): Promise<void>;
  notifyTeam(data: T): Promise<void>;
  now(): Date;
  logError(scope: string, error: unknown): void;
  contactEmail: string;
}

function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get("website");
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Validates and delivers a submission. It counts as received when it is
 * either stored or emailed to the team; only when both fail does the
 * visitor get the mailto fallback.
 */
export async function processSubmission<T>(
  formData: FormData,
  form: SubmissionForm<T>,
  deps: SubmissionDeps<T>,
): Promise<SubmissionState> {
  if (isHoneypotFilled(formData)) {
    const email = form.readValues(formData).email;
    return { status: "success", email: typeof email === "string" ? email : undefined };
  }

  const parsed = form.parse(formData);
  if (!parsed.ok) {
    return { status: "invalid", fieldErrors: parsed.fieldErrors, values: parsed.values };
  }
  const data = parsed.data;
  const values = form.readValues(formData);

  const token = formData.get("cf-turnstile-response");
  if (!(await deps.verifyCaptcha(typeof token === "string" ? token : null))) {
    return { status: "error-verify", mailto: form.buildMailto(values, deps.contactEmail), values };
  }

  if (deps.ipHash) {
    try {
      const since = new Date(deps.now().getTime() - RATE_LIMIT.windowMs);
      if ((await deps.countRecent(deps.ipHash, since)) >= RATE_LIMIT.max) {
        return { status: "rate-limited", values };
      }
    } catch (error) {
      deps.logError("rate-limit", error);
    }
  }

  let id: string | null = null;
  try {
    id = await deps.save(data, deps.ipHash);
  } catch (error) {
    deps.logError("save", error);
  }

  let notified = false;
  try {
    await deps.notifyTeam(data);
    notified = true;
  } catch (error) {
    deps.logError("notify", error);
  }

  if (id && notified) {
    try {
      await deps.markNotified(id);
    } catch (error) {
      deps.logError("mark-notified", error);
    }
  }

  if (!id && !notified) {
    return { status: "error-send", mailto: form.buildMailto(values, deps.contactEmail), values };
  }
  return { status: "success", email: form.successEmail?.(data) };
}
