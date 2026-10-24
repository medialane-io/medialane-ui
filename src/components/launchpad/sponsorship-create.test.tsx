import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { SponsorshipCreate } = await import("./sponsorship-create.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const C = "0x00000000000000000000000000000000000000000000000000000000000000c1";

function setup() {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
      tokens: { ownedBy: async () => ({ data: [{ contractAddress: C, tokenId: "1", metadata: { name: "My Song", image: null } }], meta: { page: 1, limit: 100, total: 1 } }) },
      metadata: { upload: async () => ({ data: { url: "ipfs://terms" } }) },
      sponsorship: { proposals: async () => ({ data: [] }) },
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
      <MedialaneAppProvider value={app}>
        <SponsorshipCreate />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents };
}

test("an offer needs an asset before anything is created", async () => {
  const { view, intents } = setup();
  fireEvent.click(view.getByText("Offer my asset"));
  fireEvent.click(view.getByText("Create Offer"));
  await waitFor(() => expect(view.getByText("Choose which asset you're offering.")).toBeTruthy());
  expect(intents).toEqual([]);
});

test("an offer is created with the chosen asset, amount and duration", async () => {
  const { view, intents } = setup();
  fireEvent.click(view.getByText("Offer my asset"));
  await waitFor(() => expect(view.getByText("My Song")).toBeTruthy());
  fireEvent.click(view.getByText("My Song"));
  fireEvent.change(view.getByPlaceholderText("0.00"), { target: { value: "5" } });
  fireEvent.change(view.getByPlaceholderText("e.g. 30"), { target: { value: "30" } });
  fireEvent.click(view.getByText("Create Offer"));
  await waitFor(() => expect(view.getByText("Your offer is live")).toBeTruthy());
  expect(intents[0]!.kind).toBe("sponsorship-offer");
  expect(intents[0]!.params).toMatchObject({ author: ME, nftContract: C, tokenId: "1", minAmount: "5000000", licenseTermsUri: "ipfs://terms" });
});
