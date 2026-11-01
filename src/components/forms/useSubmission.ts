"use client";

import { useActionState, useRef, type FormEvent } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";
import type { FormValues, SubmissionState } from "@/lib/submissions/types";

/**
 * `nonce` changes on every result so the form (and its single-use Turnstile
 * token) remounts; `submitted` is what was sent, for mode-aware messages.
 */
export type ClientSubmissionState = SubmissionState & { nonce: number; submitted?: FormValues };

type Action = (prev: SubmissionState, formData: FormData) => Promise<SubmissionState>;

/** Shared submit flow for the site's forms (state, fallback and double-submit guard). */
export function useSubmission(
  action: Action,
  readValues: (formData: FormData) => FormValues,
  buildMailto: (values: FormValues, to: string) => string,
) {
  const [state, formAction, pending] = useActionState(
    async (prev: ClientSubmissionState, formData: FormData): Promise<ClientSubmissionState> => {
      const nonce = prev.nonce + 1;
      const submitted = readValues(formData);
      try {
        return { ...(await action(prev, formData)), nonce, submitted };
      } catch {
        // Network failure or a stale action after a redeploy: hand over the email route.
        return {
          status: "error-send",
          mailto: buildMailto(submitted, CONTACT_EMAIL),
          values: submitted,
          nonce,
          submitted,
        };
      }
    },
    { status: "idle", nonce: 0 },
  );

  // `pending` only flips on the next render, so a fast double click could
  // still post twice; this blocks a second submit until a result arrives.
  const submittedFor = useRef(-1);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (submittedFor.current === state.nonce) event.preventDefault();
    else submittedFor.current = state.nonce;
  };

  return { state, formAction, pending, onSubmit };
}
