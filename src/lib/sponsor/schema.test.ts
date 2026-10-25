import { expect, test } from "vitest";
import { parseSponsorForm } from "./schema";

function fd(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

test("only company and email are required", () => {
  const r = parseSponsorForm(fd({ company: "شركة س", email: "a@b.co" }));
  expect(r).toEqual({ ok: true, data: { company: "شركة س", email: "a@b.co", interests: [] } });
});

test("whitespace-only company is rejected", () => {
  const r = parseSponsorForm(fd({ company: "   ", email: "a@b.co" }));
  expect(!r.ok && r.fieldErrors.company).toBe("اكتب اسم الشركة");
});

test("email is trimmed and lowercased; invalid email has the agreed message", () => {
  const ok = parseSponsorForm(fd({ company: "شركة", email: "  A@B.CO " }));
  expect(ok.ok && ok.data.email).toBe("a@b.co");
  const bad = parseSponsorForm(fd({ company: "شركة", email: "nope" }));
  expect(!bad.ok && bad.fieldErrors.email).toBe("اكتب بريدًا إلكترونيًا صحيحًا");
});

test("phone is normalized when given and rejected when invalid", () => {
  const ok = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", phone: "٠٥١٢٣٤٥٦٧٨" }));
  expect(ok.ok && ok.data.phone).toBe("+966512345678");
  const bad = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", phone: "123" }));
  expect(!bad.ok && bad.fieldErrors.phone).toBe("اكتب رقم جوال سعودي صحيح مثل 0512345678");
});

test("values outside the allowed lists are rejected", () => {
  const r = parseSponsorForm(
    fd({ company: "شركة", email: "a@b.co", sector: "x", interests: ["hack"], track: "99" }),
  );
  expect(r.ok).toBe(false);
});

test("invalid result keeps the submitted values", () => {
  const r = parseSponsorForm(fd({ company: "", email: "a@b.co", role: "مدير", interests: ["media"] }));
  expect(!r.ok && r.values).toMatchObject({ role: "مدير", interests: ["media"] });
});
