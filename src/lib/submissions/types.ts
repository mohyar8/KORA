/** What the visitor typed, echoed back so a failed submit keeps their input. */
export type FormValues = Record<string, string | string[] | undefined>;

export type FieldErrors = Partial<Record<string, string>>;

/** The result of submitting any of the site's forms (partners, speakers). */
export type SubmissionState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: FieldErrors; values: FormValues }
  | { status: "success"; email?: string }
  | { status: "error-verify"; mailto: string; values: FormValues }
  | { status: "rate-limited"; values: FormValues }
  | { status: "error-send"; mailto: string; values: FormValues };
