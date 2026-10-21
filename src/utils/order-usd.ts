import { formatUsd } from "./format.js";
import { usdPriceFor, type UsdPrices } from "./use-usd-prices.js";

export function orderUsd(price: { formatted?: string | null; currency?: string | null } | null | undefined, prices: UsdPrices | null): string | null {
  const amount = price?.formatted ? parseFloat(price.formatted) : NaN;
  const rate = price?.currency ? usdPriceFor(prices, price.currency.toUpperCase()) : undefined;
  return rate == null || isNaN(amount) ? null : formatUsd(amount * rate);
}
