"use server";

import { headers } from "next/headers";
import { CONTACT_EMAIL } from "@/lib/constants";
import { createSpeakerDbDeps } from "@/lib/speakers/db";
import { createSpeakerEmailDeps } from "@/lib/speakers/email";
import { speakerForm } from "@/lib/speakers/form";
import { getClientIp, hashIp } from "@/lib/sponsor/ip";
import { processSubmission } from "@/lib/submissions/process";
import { notifyRecipients } from "@/lib/submissions/recipients";
import { captchaVerifier } from "@/lib/submissions/turnstile";
import type { SubmissionState } from "@/lib/submissions/types";

export async function submitSpeakerRequest(
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const ip = getClientIp(await headers());
  const salt = process.env.IP_HASH_SALT;

  return processSubmission(formData, speakerForm, {
    ...createSpeakerDbDeps(process.env.DATABASE_URL),
    ...createSpeakerEmailDeps({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.SPONSOR_FROM_EMAIL,
      // The programme team's inboxes, falling back to the partners' list.
      teamTo: notifyRecipients(process.env.SPEAKERS_NOTIFY_TO, process.env.SPONSOR_NOTIFY_TO),
    }),
    verifyCaptcha: captchaVerifier(process.env.TURNSTILE_SECRET_KEY, ip),
    ipHash: ip && salt ? hashIp(ip, salt) : null,
    now: () => new Date(),
    // Scope and error text only — never the visitor's data.
    logError: (scope, error) =>
      console.error(`[speakers:${scope}]`, error instanceof Error ? error.message : error),
    contactEmail: CONTACT_EMAIL,
  });
}
