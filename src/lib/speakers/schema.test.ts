import { expect, test } from "vitest";
import { parseSpeakerForm } from "./schema";

function fd(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const base = { name: "سارة", role: "مديرة إعلام، نادي س", bio: "خبرة عشر سنوات في الإعلام الرياضي." };

test("self with phone only is accepted and the phone normalized", () => {
  const r = parseSpeakerForm(fd({ mode: "self", ...base, phone: "0512345678" }));
  expect(r.ok && r.data.phone).toBe("+966512345678");
});

test("self with only a link is rejected", () => {
  const r = parseSpeakerForm(fd({ mode: "self", ...base, link: "https://x.com/sara" }));
  expect(!r.ok && r.fieldErrors.email).toBe("أضف بريدًا أو رقم جوال للتواصل");
});

test("nomination with only a link is accepted", () => {
  const r = parseSpeakerForm(fd({ mode: "nominate", ...base, link: "https://x.com/sara" }));
  expect(r.ok).toBe(true);
});

test("nomination with no way to reach the speaker is rejected", () => {
  const r = parseSpeakerForm(fd({ mode: "nominate", ...base }));
  expect(!r.ok && r.fieldErrors.email).toBe("أضف بريد المتحدث أو جواله أو رابط حسابه");
});

test("nominator fields are dropped in self mode", () => {
  const r = parseSpeakerForm(fd({ mode: "self", ...base, email: "s@x.co", nominatorName: "خالد" }));
  expect(r.ok && r.data.nominatorName).toBeUndefined();
});

test("short bio and non-http link use the agreed messages", () => {
  const r = parseSpeakerForm(fd({ mode: "nominate", ...base, bio: "قصير", link: "ftp://x" }));
  expect(!r.ok && r.fieldErrors.bio).toBe("اكتب نبذة قصيرة (10 أحرف على الأقل)");
  expect(!r.ok && r.fieldErrors.link).toBe("اكتب رابطًا صحيحًا يبدأ بـ https://");
});
