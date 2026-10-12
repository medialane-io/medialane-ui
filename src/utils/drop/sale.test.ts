import { describe, expect, test } from "bun:test";
import { getTokenBySymbol } from "@medialane/sdk";
import { EMPTY_SALE, collectorPriceLine, priceLabel, supplyLabel, toDropTerms, validateSale } from "./sale.js";

const NOW = 1_800_000_000;
const local = (unix: number) => {
  const d = new Date(unix * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const USDC = getTokenBySymbol("USDC")!;

describe("sale terms", () => {
  test("a free drop open now, never closing, unlimited per wallet", () => {
    expect(toDropTerms(EMPTY_SALE)).toEqual({ startTime: 0, endTime: 0, price: "0", paymentToken: "0x0", maxPerWallet: "0" });
    expect(validateSale(EMPTY_SALE, NOW)).toEqual({});
  });

  test("a USDC price uses 6 decimals", () => {
    const d = { ...EMPTY_SALE, paid: true, price: "5", tokenSymbol: "USDC" };
    expect(toDropTerms(d)).toMatchObject({ price: "5000000", paymentToken: USDC.address });
  });

  test("dates, end and per-wallet limit", () => {
    const d = { ...EMPTY_SALE, startNow: false, start: local(NOW + 3600), hasEnd: true, end: local(NOW + 7200), limitPerWallet: true, perWallet: "5" };
    expect(validateSale(d, NOW)).toEqual({});
    expect(toDropTerms(d)).toMatchObject({ startTime: NOW + 3600, endTime: NOW + 7200, maxPerWallet: "5" });
  });

  test("reports each invalid field", () => {
    const d = {
      ...EMPTY_SALE, paid: true, price: "0", startNow: false, start: local(NOW - 60),
      hasEnd: true, end: local(NOW - 120), limitPerWallet: true, perWallet: "0",
    };
    expect(validateSale(d, NOW)).toEqual({
      price: "Enter a price above 0",
      start: "Pick a start time in the future",
      end: "The sale must end after it starts",
      perWallet: "Enter 1 or more",
    });
    expect(validateSale({ ...EMPTY_SALE, paid: true, price: "1.1234567", tokenSymbol: "USDC" }, NOW).price).toBe("Use at most 6 decimals for USDC");
    expect(validateSale({ ...EMPTY_SALE, paid: true, price: "abc", tokenSymbol: "USDC" }, NOW).price).toBe("Enter a price above 0");
  });

  test("the collector line includes the platform fee", () => {
    expect(collectorPriceLine({ ...EMPTY_SALE, paid: true, price: "5", tokenSymbol: "USDC" }, 100))
      .toBe("Collectors pay 5.05 USDC (incl. 1% platform fee). You receive 5 USDC.");
    expect(collectorPriceLine({ ...EMPTY_SALE, paid: true, price: "5", tokenSymbol: "USDC" }, 0))
      .toBe("Collectors pay 5 USDC.");
    expect(collectorPriceLine(EMPTY_SALE, 100)).toBeNull();
  });

  test("labels", () => {
    expect(priceLabel("0", "0x0")).toBe("Free");
    expect(priceLabel("5000000", USDC.address)).toBe("5 USDC");
    expect(supplyLabel("310", "500")).toBe("310 / 500 minted");
    expect(supplyLabel("1200", "0")).toBe("1,200 minted");
  });
});
