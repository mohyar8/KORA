import { processSubmission, type SubmissionDeps, type SubmissionForm } from "@/lib/submissions/process";
import type { SubmissionState } from "@/lib/submissions/types";
import { buildMailto } from "./mailto";
import { parseSponsorForm, readSponsorValues, type SponsorRequest } from "./schema";

export { RATE_LIMIT } from "@/lib/submissions/process";

export type SponsorDeps = SubmissionDeps<SponsorRequest>;

export const sponsorForm: SubmissionForm<SponsorRequest> = {
  parse: parseSponsorForm,
  readValues: readSponsorValues,
  buildMailto,
  successEmail: (data) => data.email,
};

export function processSponsorRequest(
  formData: FormData,
  deps: SponsorDeps,
): Promise<SubmissionState> {
  return processSubmission(formData, sponsorForm, deps);
}
