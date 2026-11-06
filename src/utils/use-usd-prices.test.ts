import { test, expect } from "bun:test";
import { usdPriceFor, usdValueFor, type UsdPrices } from "./use-usd-prices.js";

const prices: UsdPrices = { STRK: 0.42, ETH: 3100, USDC: 1 };

test("looks up a pinned symbol", () => {
  expect(usdPriceFor(prices, "STRK")).toBe(0.42);
  expect(usdPriceFor(prices, "ETH")).toBe(3100);
});

test("returns undefined for a symbol with no entry, such as a creator coin", () => {
  expect(usdPriceFor(prices, "MYCOIN")).toBeUndefined();
});

test("tolerates a null price map before the first load resolves", () => {
  expect(usdPriceFor(null, "STRK")).toBeUndefined();
});

test("a zero price is returned rather than swallowed as falsy", () => {
  expect(usdPriceFor({ STRK: 0 } as UsdPrices, "STRK")).toBe(0);
});

test("a dollar value multiplies the amount by the currency's price", () => {
  expect(usdValueFor("10", "STRK", { STRK: 0.5 })).toBe("$5.00");
});

test("a dollar value matches the currency without regard to case", () => {
  expect(usdValueFor("2", "usdc", prices)).toBe("$2.00");
});

test("a very small dollar value reads as under a cent", () => {
  expect(usdValueFor("0.001", "STRK", { STRK: 0.5 })).toBe("<$0.01");
});

test("a dollar value is null when the amount, currency, prices or rate is missing", () => {
  expect(usdValueFor(null, "STRK", prices)).toBeNull();
  expect(usdValueFor("1", null, prices)).toBeNull();
  expect(usdValueFor("1", "STRK", null)).toBeNull();
  expect(usdValueFor("1", "WBTC", prices)).toBeNull();
  expect(usdValueFor("abc", "STRK", prices)).toBeNull();
});
