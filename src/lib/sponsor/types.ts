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

export type SponsorFormState =
  | { status: "idle" }
  | {
      status: "invalid";
      fieldErrors: Partial<Record<SponsorField, string>>;
      values: SponsorFormValues;
    }
  | { status: "success"; email: string }
  | { status: "error-verify"; mailto: string; values: SponsorFormValues }
  | { status: "rate-limited"; values: SponsorFormValues }
  | { status: "error-send"; mailto: string; values: SponsorFormValues };
