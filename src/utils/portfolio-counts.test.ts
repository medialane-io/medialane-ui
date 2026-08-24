import { describe, expect, it } from "bun:test";
import { derivePortfolioCounts, type CountableOrder } from "./portfolio-counts.js";

const SELF = "0x036a8f48641d42dba28375c31651aa14a4413582da2db7655a362a9e4ffc20d2";
const SELF_UNPADDED = "0x36a8f48641d42dba28375c31651aa14a4413582da2db7655a362a9e4ffc20d2";
const OTHER = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";

function order(overrides: Partial<CountableOrder>): CountableOrder {
  return {
    status: "ACTIVE",
    offerer: OTHER,
    offer: { itemType: "ERC20" },
    ...overrides,
  };
}

describe("derivePortfolioCounts", () => {
  it("does not count a self-offer as received, even when the two address strings differ only by zero-padding", () => {
    const orders = [order({ offerer: SELF })];
    const counts = derivePortfolioCounts(orders, [], SELF_UNPADDED);
    expect(counts.received).toBe(0);
  });

  it("counts an offer from a different address as received", () => {
    const orders = [order({ offerer: OTHER })];
    const counts = derivePortfolioCounts(orders, [], SELF_UNPADDED);
    expect(counts.received).toBe(1);
  });

  it("counts a padding-mismatched self counter-offer as mine, not someone else's", () => {
    const orders = [order({ offerer: SELF, hasActiveCounterOffer: true })];
    const counts = derivePortfolioCounts(orders, [], SELF_UNPADDED);
    expect(counts.counter).toBe(1);
    expect(counts.received).toBe(0);
  });

  it("ignores non-ERC20 offers and non-ACTIVE orders for received/counter counts", () => {
    const orders = [
      order({ offerer: OTHER, offer: { itemType: "ERC721" } }),
      order({ offerer: OTHER, status: "CANCELLED" }),
    ];
    const counts = derivePortfolioCounts(orders, [], SELF_UNPADDED);
    expect(counts.received).toBe(0);
    expect(counts.listings).toBe(1);
  });

  it("handles a null/missing address without throwing", () => {
    const orders = [order({ offerer: OTHER })];
    expect(() => derivePortfolioCounts(orders, [], null)).not.toThrow();
  });

  it("handles malformed offerer addresses without throwing", () => {
    const orders = [order({ offerer: "not-an-address" })];
    expect(() => derivePortfolioCounts(orders, [], SELF_UNPADDED)).not.toThrow();
  });
});
