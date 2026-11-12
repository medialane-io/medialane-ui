"use client";

import useSWR from "swr";
import { formatUsd } from "./format.js";

export type UsdPrices = Partial<Record<"STRK" | "ETH" | "USDC" | "USDT" | "WBTC", number>>;

export function usdPriceFor(prices: UsdPrices | null, symbol: string): number | undefined {
  return (prices as Record<string, number | undefined> | null)?.[symbol];
}

export function usdValueFor(
  amountFormatted: string | null | undefined,
  currency: string | null | undefined,
  prices: UsdPrices | null,
): string | null {
  if (!amountFormatted || !currency || !prices) return null;
  const rate = usdPriceFor(prices, currency.toUpperCase());
  if (rate == null) return null;
  const amount = parseFloat(amountFormatted);
  if (isNaN(amount)) return null;
  return formatUsd(amount * rate);
}

const REFRESH_MS = 60_000;
const PRICES_KEY = "usd-prices";
const PRICES_URL = "/api/proxy/v1/prices";

async function fetchUsdPrices(): Promise<UsdPrices | null> {
  const res = await fetch(PRICES_URL);
  const body = (await res.json()) as { data?: { usd?: UsdPrices } };
  return body.data?.usd ?? null;
}

export function useUsdPrices(): UsdPrices | null {
  const { data } = useSWR(PRICES_KEY, fetchUsdPrices, {
    dedupingInterval: REFRESH_MS,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    keepPreviousData: true,
    onError: () => {},
  });
  return data ?? null;
}
