import { test, expect } from "bun:test";
import { dropCreateSchema } from "./drop-create-schema.js";

const validBase = {
  name: "Genesis", symbol: "GEN",
  ipType: "NFT", licenseType: "CC BY-SA",
  priceAmount: "", paymentToken: "0x0",
  startDate: "2026-09-01", startTime: "00:00",
  endDate: "2026-09-08", endTime: "23:59",
  maxPerWallet: "1",
};

test("gatedEnabled defaults to false and content fields default to empty", () => {
  const parsed = dropCreateSchema.parse(validBase);
  expect(parsed.gatedEnabled).toBe(false);
  expect(parsed.gatedContentTitle).toBe("");
  expect(parsed.gatedContentUrl).toBe("");
  expect(parsed.gatedContentType).toBe("");
});

test("requires a content URL when gatedEnabled is true", () => {
  const result = dropCreateSchema.safeParse({ ...validBase, gatedEnabled: true, gatedContentUrl: "" });
  expect(result.success).toBe(false);
});

test("accepts a fully filled-out exclusive content section", () => {
  const result = dropCreateSchema.safeParse({
    ...validBase,
    gatedEnabled: true,
    gatedContentTitle: "Behind the scenes",
    gatedContentUrl: "https://example.com/secret",
    gatedContentType: "VIDEO",
  });
  expect(result.success).toBe(true);
});
