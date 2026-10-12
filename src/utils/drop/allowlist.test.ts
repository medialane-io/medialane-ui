import { expect, test } from "bun:test";
import { parseAllowlist } from "./allowlist.js";

const pad = (h: string) => "0x" + h.replace(/^0x/, "").padStart(64, "0");

test("keeps each wallet once and reports what it could not read", () => {
  const raw = "address\n0x111, 0x222\n\n0x0111\nhello\n0x0\n0xZZ\n" + "0x" + "f".repeat(64);
  expect(parseAllowlist(raw)).toEqual({
    addresses: [pad("0x111"), pad("0x222")],
    invalid: ["hello", "0x0", "0xZZ", "0x" + "f".repeat(64)],
    duplicates: ["0x0111"],
  });
});

test("an empty paste is an empty list", () => {
  expect(parseAllowlist("  \n ")).toEqual({ addresses: [], invalid: [], duplicates: [] });
});
