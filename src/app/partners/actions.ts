"use server";

import { headers } from "next/headers";
import { CONTACT_EMAIL } from "@/lib/constants";
import { createDbDeps } from "@/lib/sponsor/db";
import { createEmailDeps } from "@/lib/sponsor/email";
import { getClientIp, hashIp } from "@/lib/sponsor/ip";
import { processSponsorRequest } from "@/lib/sponsor/process";
import { verifyTurnstile } from "@/lib/sponsor/turnstile";
import type { SponsorFormState } from "@/lib/sponsor/types";

export async function submitSponsorRequest(
  _prev: SponsorFormState,
  formData: FormData,
): Promise<SponsorFormState> {
  const ip = getClientIp(await headers());
  const salt = process.env.IP_HASH_SALT;

  return processSponsorRequest(formData, {
    ...createDbDeps(process.env.DATABASE_URL),
    ...createEmailDeps({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.SPONSOR_FROM_EMAIL,
      // Defaults to the official inbox; override to the Resend account's own
      // address while sending from onboarding@resend.dev (no verified domain).
      teamTo: process.env.SPONSOR_NOTIFY_TO || CONTACT_EMAIL,
    }),
    verifyCaptcha: (token) => verifyTurnstile(token, ip, process.env.TURNSTILE_SECRET_KEY ?? ""),
    ipHash: ip && salt ? hashIp(ip, salt) : null,
    now: () => new Date(),
    // Scope and error text only — never the visitor's data.
    logError: (scope, error) =>
      console.error(`[sponsor:${scope}]`, error instanceof Error ? error.message : error),
    contactEmail: CONTACT_EMAIL,
  });
}
