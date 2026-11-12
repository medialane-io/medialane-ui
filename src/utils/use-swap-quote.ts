"use client";

import useSWR from "swr";
import type { ApiSwapQuote } from "@medialane/sdk";
import { useMedialaneApp } from "../components/medialane-app.js";
import { useMedialaneClient } from "./use-medialane-client.js";

export type SwapQuoteSummary = ApiSwapQuote;

export type SwapToken = string | { address: string };

export type SwapAmountMode = "sell" | "buy";

function tokenKey(token: SwapToken): string {
  return typeof token === "string" ? token : token.address;
}

function tokenBody(token: SwapToken, side: "sell" | "buy") {
  return typeof token === "string"
    ? { [`${side}Symbol`]: token }
    : { [`${side}TokenAddress`]: token.address };
}

export function swapQuoteKey(
  signedIn: boolean | undefined,
  sell: SwapToken | null,
  buy: SwapToken | null,
  amountRaw: string | null,
  amountMode: SwapAmountMode,
  takerAddress: string | null,
) {
  return signedIn && sell && buy && amountRaw
    ? (["swap-quote", tokenKey(sell), tokenKey(buy), amountRaw, amountMode, takerAddress] as const)
    : null;
}

export function useSwapQuote(
  sell: SwapToken | null,
  buy: SwapToken | null,
  amountRaw: string | null,
  takerAddress: string | null,
  amountMode: SwapAmountMode = "buy",
) {
  const client = useMedialaneClient();
  const { signedIn } = useMedialaneApp();
  const { data, error, isLoading } = useSWR(
    swapQuoteKey(signedIn, sell, buy, amountRaw, amountMode, takerAddress),
    () =>
      client.api.platform.swapQuote({
        ...tokenBody(sell!, "sell"),
        ...tokenBody(buy!, "buy"),
        [`${amountMode}AmountRaw`]: amountRaw!,
        takerAddress: takerAddress ?? undefined,
      }),
    {
      refreshInterval: 20_000,
      dedupingInterval: 15_000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );
  return { quote: data ?? null, isLoading, error: error as Error | undefined };
}
