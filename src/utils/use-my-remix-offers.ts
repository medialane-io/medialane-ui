"use client";

import useSWR from "swr";
import type { ApiRemixOffer, ApiResponse } from "@medialane/sdk";
import { useMedialaneApp } from "../components/medialane-app.js";
import { useMedialaneClient } from "./use-medialane-client.js";

export function useRemixOffers(role: "creator" | "requester", status?: string) {
  const client = useMedialaneClient();
  const { walletAddress, signedIn } = useMedialaneApp();
  const key = walletAddress && signedIn ? `remix-offers-${role}-${status ?? "all"}-${walletAddress}` : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiRemixOffer[]>>(
    key,
    () => client.api.remix.list({ role, status }),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      onErrorRetry: (_err, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    },
  );

  return { offers: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, error, mutate };
}
