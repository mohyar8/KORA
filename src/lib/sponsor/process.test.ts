import { expect, test, vi } from "vitest";
import { processSponsorRequest, type SponsorDeps } from "./process";

function fd(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const valid = { company: "شركة س", email: "a@b.co", "cf-turnstile-response": "tok" };

function makeDeps(overrides: Partial<SponsorDeps> = {}): SponsorDeps {
  return {
    verifyCaptcha: vi.fn(async () => true),
    ipHash: "h",
    countRecent: vi.fn(async () => 0),
    save: vi.fn(async () => "id-1"),
    markNotified: vi.fn(async () => {}),
    notifyTeam: vi.fn(async () => {}),
    now: () => new Date("2026-10-25T10:00:00Z"),
    logError: vi.fn(),
    contactEmail: "team@kora.sa",
    ...overrides,
  };
}

test("honeypot: reports success without saving anything", async () => {
  const deps = makeDeps();
  const state = await processSponsorRequest(fd({ ...valid, website: "spam.com" }), deps);
  expect(state.status).toBe("success");
  expect(deps.save).not.toHaveBeenCalled();
  expect(deps.notifyTeam).not.toHaveBeenCalled();
});

test("captcha failure (e.g. Turnstile blocked): error-verify with mailto, nothing saved", async () => {
  const deps = makeDeps({ verifyCaptcha: vi.fn(async () => false) });
  const state = await processSponsorRequest(fd(valid), deps);
  expect(state.status).toBe("error-verify");
  expect(state.status === "error-verify" && state.mailto).toContain("mailto:team@kora.sa");
  expect(deps.save).not.toHaveBeenCalled();
});

test("rate limit reached: rate-limited, nothing saved", async () => {
  const deps = makeDeps({ countRecent: vi.fn(async () => 5) });
  const state = await processSponsorRequest(fd(valid), deps);
  expect(state.status).toBe("rate-limited");
  expect(deps.save).not.toHaveBeenCalled();
});

test("happy path: saved, team notified, marked", async () => {
  const deps = makeDeps();
  const state = await processSponsorRequest(fd(valid), deps);
  expect(state).toEqual({ status: "success", email: "a@b.co" });
  expect(deps.markNotified).toHaveBeenCalledWith("id-1");
});

test("one channel failing (e.g. missing RESEND key) still succeeds", async () => {
  const fail = vi.fn(async () => {
    throw new Error("email not configured");
  });
  const deps = makeDeps({ notifyTeam: fail });
  const state = await processSponsorRequest(fd(valid), deps);
  expect(state.status).toBe("success");
  expect(deps.markNotified).not.toHaveBeenCalled();
  expect(deps.logError).toHaveBeenCalledWith("notify", expect.any(Error));
});

test("both channels failing: error-send with mailto", async () => {
  const fail = vi.fn(async () => {
    throw new Error("down");
  });
  const deps = makeDeps({ save: fail, notifyTeam: fail });
  const state = await processSponsorRequest(fd(valid), deps);
  expect(state.status).toBe("error-send");
  expect(state.status === "error-send" && decodeURIComponent(state.mailto)).toContain("شركة س");
});
