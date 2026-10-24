import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { getListableTokens } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { SponsorshipOffersPage } = await import("./sponsorship-offers-page.js");
const { SponsorshipOfferPage } = await import("./sponsorship-offer-page.js");
const { PortfolioSponsorships } = await import("./portfolio-sponsorships.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const C = "0x00000000000000000000000000000000000000000000000000000000000000c1";
const TOKEN = getListableTokens()[0]!;

const offer = (author: string, open = true) => ({
  id: "o1", chain: "STARKNET", contractAddress: C, offerId: "7", author, nftContract: C, tokenId: "1",
  minAmount: "5000000", duration: 2592000, paymentToken: TOKEN.address, licenseTermsUri: "ipfs://t", transferable: true,
  royaltyBps: 500, specificSponsor: null, open, createdAtChain: "", updatedAt: "",
});

function setup(ui: React.ReactNode, data: { offer?: ReturnType<typeof offer>; bids?: unknown[]; proposals?: unknown[] } = {}) {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
      tokens: { get: async () => ({ metadata: { name: "My Song", image: null } }) },
      sponsorship: {
        offers: async () => ({ data: data.offer ? [data.offer] : [], meta: { page: 1, limit: 50, total: 1 } }),
        findOffer: async () => data.offer ?? null,
        bids: async () => data.bids ?? [],
        proposals: async () => ({ data: data.proposals ?? [], meta: { page: 1, limit: 50, total: 0 } }),
        licenses: async () => ({ data: [], meta: { page: 1, limit: 50, total: 0 } }),
      },
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => { intents.push({ kind, params }); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: ME, execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    walletAddress: ME,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>{ui}</MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents };
}

test("open offers link to their own page", async () => {
  const { view } = setup(<SponsorshipOffersPage />, { offer: offer(OTHER) });
  await waitFor(() => expect(view.getByText("My Song")).toBeTruthy());
  expect(view.getByText("My Song").closest("a")?.getAttribute("href")).toBe("/launchpad/sponsorship/7");
});

test("a sponsor bids the amount typed, in the offer's currency", async () => {
  const { view, intents } = setup(<SponsorshipOfferPage offerId="7" />, { offer: offer(OTHER) });
  await waitFor(() => expect(view.getByText("Place a bid")).toBeTruthy());
  const button = view.getByText("Place bid") as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.change(view.getByPlaceholderText("Your bid"), { target: { value: "2" } });
  fireEvent.click(button);
  await waitFor(() => expect(view.getByText("Bid placed!")).toBeTruthy());
  expect(intents[0]).toEqual({
    kind: "sponsorship-bid",
    params: { sponsor: ME, offerId: "7", amount: String(2 * 10 ** TOKEN.decimals), paymentToken: TOKEN.address },
  });
});

test("the author accepts a bid from the offer page", async () => {
  const { view, intents } = setup(<SponsorshipOfferPage offerId="7" />, { offer: offer(ME), bids: [{ id: "b1", sponsor: OTHER, amount: "6000000" }] });
  await waitFor(() => expect(view.getByText("Accept")).toBeTruthy());
  fireEvent.click(view.getByText("Accept"));
  await waitFor(() => expect(view.getByText("Bid accepted!")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "sponsorship-bid-accept", params: { author: ME, offerId: "7", sponsor: OTHER } });
});

test("a closed offer takes no bids", async () => {
  const { view } = setup(<SponsorshipOfferPage offerId="7" />, { offer: offer(OTHER, false) });
  await waitFor(() => expect(view.getByText("This offer is no longer open.")).toBeTruthy());
  expect(view.queryByText("Place bid")).toBeNull();
});

test("an owner accepts a proposal from the portfolio", async () => {
  const proposal = { id: "p1", proposalId: "3", proposer: OTHER, nftContract: C, tokenId: "1", amount: "9" };
  const { view, intents } = setup(<PortfolioSponsorships />, { proposals: [proposal] });
  await waitFor(() => expect(view.getAllByLabelText("Accept proposal").length).toBe(1));
  fireEvent.click(view.getByLabelText("Accept proposal"));
  await waitFor(() => expect(view.getByText("Response sent!")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "sponsorship-proposal-accept", params: { owner: ME, proposalId: "3" } });
});
