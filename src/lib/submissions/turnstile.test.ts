import { expect, test, vi } from "vitest";
import { captchaVerifier } from "./turnstile";

test("without a secret the check is skipped and passes", async () => {
  const fetchImpl = vi.fn();
  expect(await captchaVerifier(undefined, null, fetchImpl)("")).toBe(true);
  expect(fetchImpl).not.toHaveBeenCalled();
});

test("with a secret a failed verification is rejected", async () => {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: false })));
  expect(await captchaVerifier("s", null, fetchImpl)("tok")).toBe(false);
});
