import { buildMailto } from "./mailto";
import { isHoneypotFilled, parseSponsorForm, readSponsorValues, type SponsorRequest } from "./schema";
import type { SponsorFormState } from "./types";

export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 } as const;

/** Everything the pipeline touches outside itself, injected so it can be tested. */
export interface SponsorDeps {
  verifyCaptcha(token: string | null): Promise<boolean>;
  ipHash: string | null;
  countRecent(ipHash: string, since: Date): Promise<number>;
  /** Stores the request and returns its id. */
  save(req: SponsorRequest, ipHash: string | null): Promise<string>;
  markNotified(id: string): Promise<void>;
  notifyTeam(req: SponsorRequest): Promise<void>;
  now(): Date;
  logError(scope: string, error: unknown): void;
  contactEmail: string;
}

/**
 * Validates and delivers a sponsorship request. A request counts as received
 * when it is either stored or emailed to the team; only when both fail does
 * the visitor get the mailto fallback.
 */
export async function processSponsorRequest(
  formData: FormData,
  deps: SponsorDeps,
): Promise<SponsorFormState> {
  if (isHoneypotFilled(formData)) {
    return { status: "success", email: readSponsorValues(formData).email ?? "" };
  }

  const parsed = parseSponsorForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", fieldErrors: parsed.fieldErrors, values: parsed.values };
  }
  const req = parsed.data;
  const values = readSponsorValues(formData);

  const token = formData.get("cf-turnstile-response");
  if (!(await deps.verifyCaptcha(typeof token === "string" ? token : null))) {
    return { status: "error-verify", mailto: buildMailto(values, deps.contactEmail), values };
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
    id = await deps.save(req, deps.ipHash);
  } catch (error) {
    deps.logError("save", error);
  }

  let notified = false;
  try {
    await deps.notifyTeam(req);
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
    return { status: "error-send", mailto: buildMailto(values, deps.contactEmail), values };
  }
  return { status: "success", email: req.email };
}
