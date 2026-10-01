"use client";

import useSWR from "swr";
import { getTokenBySymbol, type ApiCoinPrices } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { CoinMarketStatus } from "../components/coin-row.js";
import type { CoinCollectionLike, CoinPriceLike } from "../data/coins.js";
import { useMedialaneClient } from "./use-medialane-client.js";
import { normalizeAddress } from "@medialane/sdk";

const REFRESH_MS = 60_000;

function useAllCoinPrices(getClient: () => MedialaneClient) {
  const client = useMedialaneClient(getClient);
  const { data, isLoading } = useSWR<ApiCoinPrices>(
    "coin-prices",
    async () => (await client.api.getCoinPrices()).data,
    { revalidateOnFocus: false, refreshInterval: REFRESH_MS, shouldRetryOnError: false }
  );
  return { prices: data ?? null, isLoading };
}

export function usePriceMap(getClient: () => MedialaneClient) {
  const { prices, isLoading } = useAllCoinPrices(getClient);
  const map: Record<string, number | null> = {};
  if (prices) {
    for (const [address, entry] of Object.entries(prices)) {
      map[address] = entry?.usdc ?? null;
    }
  }
  return { prices: map, isLoading };
}

export function useCoinPrice(getClient: () => MedialaneClient, coin: CoinCollectionLike): {
  price: CoinPriceLike | null;
  status: CoinMarketStatus;
  isLoading: boolean;
} {
  const { prices, isLoading } = useAllCoinPrices(getClient);

  if (isLoading || !prices) return { price: null, status: "unavailable", isLoading };

  const usdc = prices[normalizeAddress("STARKNET", coin.contractAddress)]?.usdc ?? null;

  if (usdc == null) {
    return {
      price: null,
      status: coin.isLaunched === false ? "pre-launch" : "unavailable",
      isLoading: false,
    };
  }

  const strk = getTokenBySymbol("STRK");
  const strkUsdc = strk ? (prices[normalizeAddress("STARKNET", strk.address)]?.usdc ?? null) : null;

  return {
    price: {
      quotePerCoin: strkUsdc ? usdc / strkUsdc : usdc,
      quoteSymbol: strkUsdc ? "STRK" : "USDC",
      quoteUsdRate: strkUsdc ?? 1,
    },
    status: "live",
    isLoading: false,
  };
}
