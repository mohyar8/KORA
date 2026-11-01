const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Server-side check of a Cloudflare Turnstile token. Any failure counts as "not verified". */
export async function verifyTurnstile(
  token: string | null,
  ip: string | null,
  secret: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token || !secret) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetchImpl(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

/**
 * Turnstile is optional: with no secret configured the check is skipped,
 * leaving the honeypot and rate limit as the form's protection.
 */
export function captchaVerifier(
  secret: string | undefined,
  ip: string | null,
  fetchImpl: typeof fetch = fetch,
): (token: string | null) => Promise<boolean> {
  if (!secret) return async () => true;
  return (token) => verifyTurnstile(token, ip, secret, fetchImpl);
}
