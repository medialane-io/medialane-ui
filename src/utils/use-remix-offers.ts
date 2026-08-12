"use client";

import useSWR from "swr";
import { apiFetch, type ApiFetchConfig } from "./api-fetch.js";
import type { ApiPublicRemix } from "@medialane/sdk";

/** Public remixes of a token — no wallet/auth dependency. */
export function useTokenRemixes(apiConfig: ApiFetchConfig, contract: string | null, tokenId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ data: ApiPublicRemix[]; meta: { total: number } }>(
    contract && tokenId ? `token-remixes-${contract}-${tokenId}` : null,
    () => apiFetch(apiConfig, `/v1/tokens/${contract}/${tokenId}/remixes`),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  return { remixes: data?.data ?? [], total: data?.meta.total ?? 0, isLoading, error, mutate };
}
