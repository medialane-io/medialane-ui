"use client";

import useSWR from "swr";
import type { CreatorCoinGuarantees } from "@medialane/sdk/starknet";
import { useMedialaneApp } from "../components/medialane-app.js";

export function useCoinGuarantees(coinAddress?: string | null, enabled = true) {
  const { getClient } = useMedialaneApp();
  const { data, error, isLoading } = useSWR<CreatorCoinGuarantees | null>(
    coinAddress && enabled ? `coin-guarantees-${coinAddress}` : null,
    () => getClient().api.chainReads.coinGuarantees(coinAddress as string),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  return { guarantees: data ?? null, isLoading, error };
}
