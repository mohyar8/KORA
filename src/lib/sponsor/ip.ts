import { createHash } from "node:crypto";

/** The visitor's IP as reported by the platform proxy (Vercel sets x-forwarded-for). */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || null;
}

/** Salted hash so rate limiting never stores a raw IP address. */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(salt + ip).digest("hex");
}
