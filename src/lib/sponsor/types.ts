export type SponsorField =
  | "company"
  | "email"
  | "contactName"
  | "role"
  | "phone"
  | "sector"
  | "interests"
  | "track"
  | "message";

/** What the visitor typed, echoed back so a failed submit keeps their input. */
export type SponsorFormValues = Partial<Record<Exclude<SponsorField, "interests">, string>> & {
  interests?: string[];
};

export type { SubmissionState as SponsorFormState } from "@/lib/submissions/types";
