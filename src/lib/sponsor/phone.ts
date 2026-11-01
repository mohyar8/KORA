const SAUDI_MOBILE = /^(?:\+?966|00966|0)(5\d{8})$/;
const INTERNATIONAL = /^\+\d{8,15}$/;

/** Latin digits only, without spaces, dashes or brackets. */
function clean(raw: string): string {
  return raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-()]/g, "");
}

/**
 * Normalizes a Saudi mobile number to `+9665XXXXXXXX`, or returns null.
 * Accepts Arabic-Indic and Persian digits (common on Arabic keyboards)
 * and ignores spaces, dashes and brackets.
 */
export function normalizeSaudiPhone(raw: string): string | null {
  const match = SAUDI_MOBILE.exec(clean(raw));
  return match ? `+966${match[1]}` : null;
}

/** A Saudi mobile (normalized as above) or any international `+` number. */
export function normalizeAnyPhone(raw: string): string | null {
  const saudi = normalizeSaudiPhone(raw);
  if (saudi) return saudi;
  const latin = clean(raw).replace(/^00/, "+");
  return INTERNATIONAL.test(latin) ? latin : null;
}
