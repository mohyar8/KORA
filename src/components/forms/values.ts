import type { FormValues } from "@/lib/submissions/types";

/** A single echoed field value, for `defaultValue`. */
export function asText(value: FormValues[string]): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** A multi-choice echoed field value, for `defaultChecked`. */
export function asList(value: FormValues[string]): string[] {
  return Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
}
