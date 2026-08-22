import { test, expect } from "bun:test";
import { usdPriceFor, type UsdPrices } from "./use-usd-prices.js";

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
