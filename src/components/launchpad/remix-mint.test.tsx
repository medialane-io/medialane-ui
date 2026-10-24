import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { hash } from "starknet";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";

const replaced: string[] = [];
mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: (href: string) => { replaced.push(href); }, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { RemixMint } = await import("./remix-mint.js");

afterEach(() => { cleanup(); replaced.length = 0; });

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const PARENT = "0x00000000000000000000000000000000000000000000000000000000000000d1";
const MINE = "0x00000000000000000000000000000000000000000000000000000000000000c5";

function setup(parent: { owner: string; derivatives: string }) {
  const intents: Record<string, unknown>[] = [];
  const confirmed: Record<string, unknown>[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [{ from_address: MINE, keys: [hash.getSelectorFromName("IPMinted"), "0x9", "0x0"], data: [] }] }) },
    api: {
      tokens: {
        get: async () => ({ owner: parent.owner, metadata: { name: "Original", image: null, description: null, attributes: [{ trait_type: "Derivatives", value: parent.derivatives }] } }),
        balance: async () => ({ amount: parent.owner === ME ? "1" : "0" }),
      },
      collections: {
        get: async () => ({ service: "mip-erc721" }),
        list: async () => ({ data: [{ collectionId: "3", contractAddress: MINE, name: "My art", service: "mip-erc721", standard: "ERC721" }] }),
      },
      metadata: { upload: async () => ({ data: { url: "ipfs://remix" } }) },
      intents: {
        create: async (_kind: string, params: Record<string, unknown>) => { intents.push(params); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      remix: { confirmSelf: async (body: Record<string, unknown>) => { confirmed.push(body); return {}; } },
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
        <RemixMint contract={PARENT} tokenId="1" />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents, confirmed };
}

test("the owner mints a remix and it is registered against its parent", async () => {
  const { view, intents, confirmed } = setup({ owner: ME, derivatives: "Not Allowed" });
  await waitFor(() => expect(view.getByText("Mint Remix")).toBeTruthy());
  await waitFor(() => expect((view.getByPlaceholderText("Remix of Original") as HTMLInputElement).value).toBe("Remix of Original"));
  await waitFor(() => expect(view.getAllByText("My art").length).toBeGreaterThan(0));
  fireEvent.click(view.getByText("Mint Remix"));
  await waitFor(() => expect(view.getByText("Your remix is live")).toBeTruthy());
  expect(intents[0]).toMatchObject({ owner: ME, collectionId: "3", recipient: ME, tokenUri: "ipfs://remix", royaltyBps: 0 });
  expect(confirmed[0]).toMatchObject({ originalContract: PARENT, originalTokenId: "1", remixContract: MINE, remixTokenId: "9", txHash: "0xabc" });
  expect(view.getByText("View remix").closest("a")?.getAttribute("href")).toBe(`/asset/starknet/${MINE}/9`);
});

test("someone who may not remix directly is sent back to the asset", async () => {
  setup({ owner: OTHER, derivatives: "Not Allowed" });
  await waitFor(() => expect(replaced).toEqual([`/asset/starknet/${PARENT}/1`]));
});
