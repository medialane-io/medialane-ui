import { afterAll, afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { hash } from "starknet";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));
(globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
(globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};
const originalFetch = global.fetch;
global.fetch = (async () => ({ ok: true, json: async () => ({ data: { cid: "bafyimg" } }) }) as Response) as unknown as typeof fetch;
afterAll(() => { global.fetch = originalFetch; });

const { SingleEditionMint } = await import("./single-edition-mint.js");

afterEach(() => cleanup());

const OWNER = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const CONTRACT = "0x00000000000000000000000000000000000000000000000000000000000000c5";

function setup(collections: unknown[]) {
  const intents: Record<string, unknown>[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [{ from_address: CONTRACT, keys: [hash.getSelectorFromName("IPMinted"), "0x9", "0x0"], data: [] }] }) },
    api: {
      collections: { list: async () => ({ data: collections }) },
      metadata: { signedUrl: async () => ({ data: { url: "https://upload.example/signed" } }), upload: async () => ({ data: { url: "ipfs://meta" } }) },
      intents: {
        create: async (_kind: string, params: Record<string, unknown>) => { intents.push(params); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: OWNER, execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    walletAddress: OWNER,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <SingleEditionMint />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents };
}

const COLLECTION = { collectionId: "3", contractAddress: CONTRACT, name: "Art", service: "mip-erc721", totalSupply: 2, image: null };

test("someone with no collection is invited to create one first", async () => {
  const { view } = setup([]);
  await waitFor(() => expect(view.getByText("Create your first collection")).toBeTruthy());
});

test("a work is minted into the chosen collection and links to the new asset", async () => {
  const { view, intents } = setup([COLLECTION]);
  await waitFor(() => expect(view.getAllByText("Art").length).toBeGreaterThan(0));
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });
  fireEvent.change(view.getByPlaceholderText("My Creative Work"), { target: { value: "Starry Night" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Your work is live")).toBeTruthy());
  expect(intents[0]).toMatchObject({ owner: OWNER, collectionId: "3", recipient: OWNER, tokenUri: "ipfs://meta", royaltyBps: 0 });
  expect(view.getByText("View asset").closest("a")?.getAttribute("href")).toBe(`/asset/starknet/${CONTRACT}/9`);
});
