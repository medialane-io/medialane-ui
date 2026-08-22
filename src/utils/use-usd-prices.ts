"use client";

import useSWR from "swr";

export type UsdPrices = Partial<Record<"STRK" | "ETH" | "USDC" | "USDT" | "WBTC", number>>;

/** Looks up a USD price by an arbitrary token symbol (not just the pinned
 * set UsdPrices is keyed on) — a coin/memecoin symbol simply has no entry. */
export function usdPriceFor(prices: UsdPrices | null, symbol: string): number | undefined {
  return (prices as Record<string, number | undefined> | null)?.[symbol];
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
    refreshInterval: REFRESH_MS,
    dedupingInterval: REFRESH_MS,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    keepPreviousData: true,
    onError: () => {},
  });
  return data ?? null;
}
