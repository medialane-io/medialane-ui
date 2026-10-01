"use client";

import useSWR from "swr";
import type { ApiSponsorshipOffer, ApiSponsorshipBid, ApiSponsorshipProposal, ApiSponsorshipLicense, ApiResponse } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useMedialaneClient } from "./use-medialane-client.js";

export type {
  ApiSponsorshipOffer as SponsorshipOffer,
  ApiSponsorshipBid as SponsorshipBid,
  ApiSponsorshipProposal as SponsorshipProposal,
  ApiSponsorshipLicense as SponsorshipLicense,
} from "@medialane/sdk";

export function useSponsorshipOffers(getClient: () => MedialaneClient, params?: { nftContract?: string; author?: string; owner?: string; open?: boolean }) {
  const key = `sponsorship-offers-${JSON.stringify(params ?? {})}`;
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiSponsorshipOffer[]>>(
    key,
    () => client.api.getSponsorshipOffers({ ...params, limit: 50 }),
    { revalidateOnFocus: false }
  );

  return { offers: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}

export function useSponsorshipOffer(getClient: () => MedialaneClient, offerId: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiSponsorshipOffer | null>(
    offerId ? `sponsorship-offer-${offerId}` : null,
    () => client.api.getSponsorshipOffer(offerId!),
    { revalidateOnFocus: false }
  );

  return { offer: data ?? null, isLoading, error, mutate };
}

export function useSponsorshipBids(getClient: () => MedialaneClient, offerId: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiSponsorshipBid[]>(
    offerId ? `sponsorship-bids-${offerId}` : null,
    () => client.api.getSponsorshipBids(offerId!),
    { revalidateOnFocus: false }
  );

  return { bids: data ?? [], isLoading, error, mutate };
}

export function useSponsorshipProposals(getClient: () => MedialaneClient, params?: { nftContract?: string; proposer?: string; owner?: string; open?: boolean }) {
  const key = `sponsorship-proposals-${JSON.stringify(params ?? {})}`;
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiSponsorshipProposal[]>>(
    key,
    () => client.api.getSponsorshipProposals({ ...params, limit: 50 }),
    { revalidateOnFocus: false }
  );

  return { proposals: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}

export function useSponsorshipProposal(getClient: () => MedialaneClient, proposalId: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiSponsorshipProposal | null>(
    proposalId ? `sponsorship-proposal-${proposalId}` : null,
    () => client.api.getSponsorshipProposal(proposalId!),
    { revalidateOnFocus: false }
  );

  return { proposal: data ?? null, isLoading, error, mutate };
}

export function usePendingProposalsForAsset(getClient: () => MedialaneClient, nftContract: string | null) {
  const { proposals, isLoading, error, mutate } = useSponsorshipProposals(
    getClient,
    nftContract ? { nftContract, open: true } : undefined
  );
  return { proposals: nftContract ? proposals : [], isLoading, error, mutate };
}

export function useSponsorshipLicenses(getClient: () => MedialaneClient, params?: { holder?: string; author?: string }) {
  const key = `sponsorship-licenses-${JSON.stringify(params ?? {})}`;
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiSponsorshipLicense[]>>(
    key,
    () => client.api.getSponsorshipLicenses({ ...params, limit: 50 }),
    { revalidateOnFocus: false }
  );

  return { licenses: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}

export function useMySponsorshipDealCounts(getClient: () => MedialaneClient, walletAddress: string | null) {
  const { proposals, isLoading: proposalsLoading } = useSponsorshipProposals(
    getClient,
    walletAddress ? { owner: walletAddress, open: true } : undefined
  );
  const { offers, isLoading: offersLoading } = useSponsorshipOffers(
    getClient,
    walletAddress ? { author: walletAddress, open: true } : undefined
  );

  void offers;
  return { pendingCount: proposals.length, isLoading: proposalsLoading || offersLoading };
}
