const SAUDI_MOBILE = /^(?:\+?966|00966|0)(5\d{8})$/;

/**
 * Normalizes a Saudi mobile number to `+9665XXXXXXXX`, or returns null.
 * Accepts Arabic-Indic and Persian digits (common on Arabic keyboards)
 * and ignores spaces, dashes and brackets.
 */
export function normalizeSaudiPhone(raw: string): string | null {
  const latin = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-()]/g, "");
  const match = SAUDI_MOBILE.exec(latin);
  return match ? `+966${match[1]}` : null;
}
