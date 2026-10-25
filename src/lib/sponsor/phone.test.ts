import { expect, test } from "vitest";
import { normalizeSaudiPhone } from "./phone";

test.each([
  ["0512345678", "+966512345678"],
  ["+966512345678", "+966512345678"],
  ["00966512345678", "+966512345678"],
  ["966512345678", "+966512345678"],
  ["051 234 5678", "+966512345678"],
  ["051-234-5678", "+966512345678"],
  ["٠٥١٢٣٤٥٦٧٨", "+966512345678"],
])("normalizes %s", (raw, out) => expect(normalizeSaudiPhone(raw)).toBe(out));

test.each(["0412345678", "05123", "abc", "", "+9715123456789"])("rejects %s", (raw) =>
  expect(normalizeSaudiPhone(raw)).toBeNull(),
);
