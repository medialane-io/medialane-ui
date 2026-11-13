import { describe, expect, test } from "bun:test";
import { LISTABLE_CURRENCIES, counterOfferFormSchema, orderFormSchema } from "./order-form.js";

const valid = { price: "1.5", currency: LISTABLE_CURRENCIES[0]!, durationSeconds: 86400 };

describe("orderFormSchema", () => {
  test("accepts a listed currency and a positive price", () => {
    expect(orderFormSchema.safeParse(valid).success).toBe(true);
  });

  test("rejects a price of zero", () => {
    const result = orderFormSchema.safeParse({ ...valid, price: "0" });
    expect(result.success).toBe(false);
  });

  test("rejects an empty price with its own message", () => {
    const result = orderFormSchema.safeParse({ ...valid, price: "" });
    expect(!result.success && result.error.issues[0]?.message).toBe("Price required");
  });

  test("rejects a currency that is not listed", () => {
    const result = orderFormSchema.safeParse({ ...valid, currency: "NOPE" });
    expect(!result.success && result.error.issues[0]?.message).toBe("Invalid currency");
  });

  test("rejects a duration under a day", () => {
    expect(orderFormSchema.safeParse({ ...valid, durationSeconds: 3600 }).success).toBe(false);
  });
});

describe("counterOfferFormSchema", () => {
  test("accepts an hour", () => {
    expect(counterOfferFormSchema.safeParse({ price: "2", durationSeconds: 3600 }).success).toBe(true);
  });

  test("rejects fifty-nine minutes", () => {
    expect(counterOfferFormSchema.safeParse({ price: "2", durationSeconds: 3540 }).success).toBe(false);
  });

  test("rejects a message over 500 characters", () => {
    expect(counterOfferFormSchema.safeParse({ price: "2", durationSeconds: 3600, message: "x".repeat(501) }).success).toBe(false);
  });
});
