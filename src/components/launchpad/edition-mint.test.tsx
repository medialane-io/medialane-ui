import { afterAll, afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
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

const { EditionMint } = await import("./edition-mint.js");

afterEach(() => cleanup());

const OWNER = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const CONTRACT = "0x00000000000000000000000000000000000000000000000000000000000000c7";

function setup(collectionOwner: string) {
  const intents: Record<string, unknown>[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [{ from_address: CONTRACT, keys: [hash.getSelectorFromName("IPMinted"), "0x4", "0x0"], data: [] }] }) },
    api: {
      collections: { get: async () => ({ owner: collectionOwner }) },
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
    <MedialaneAppProvider value={app}>
      <EditionMint contract={CONTRACT} />
    </MedialaneAppProvider>,
  );
  return { view, intents };
}

test("only the collection owner can mint into it", async () => {
  const { view } = setup("0x00000000000000000000000000000000000000000000000000000000000000bb");
  await waitFor(() => expect(view.getByText("Not the owner")).toBeTruthy());
});

test("an edition needs an image before anything is created", async () => {
  const { view, intents } = setup(OWNER);
  await waitFor(() => expect(view.getByPlaceholderText("Genesis Track #1")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("Genesis Track #1"), { target: { value: "Track" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Upload an image before minting.")).toBeTruthy());
  expect(intents).toEqual([]);
});

test("an edition is minted with its quantity and links to the new asset", async () => {
  const { view, intents } = setup(OWNER);
  await waitFor(() => expect(view.getByPlaceholderText("Genesis Track #1")).toBeTruthy());
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });
  await waitFor(() => expect(view.getByText("✓ Image uploaded to IPFS")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("Genesis Track #1"), { target: { value: "Track" } });
  fireEvent.change(view.getByPlaceholderText("1"), { target: { value: "25" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Mint another")).toBeTruthy());
  expect(intents[0]).toMatchObject({ owner: OWNER, recipient: OWNER, collectionContract: CONTRACT, tokenUri: "ipfs://meta", value: "25", royaltyBps: 0 });
  expect(view.getByText("View asset").closest("a")?.getAttribute("href")).toBe(`/asset/starknet/${CONTRACT}/4`);
});
