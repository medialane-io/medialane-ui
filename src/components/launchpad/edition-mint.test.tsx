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

function setup(collectionOwner: string, metadata: Record<string, unknown> = {}, collectionName: string | null = "Night Songs") {
  const intents: Record<string, unknown>[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [{ from_address: CONTRACT, keys: [hash.getSelectorFromName("IPMinted"), "0x4", "0x0"], data: [] }] }) },
    api: {
      collections: { get: async () => ({ owner: collectionOwner, name: collectionName }) },
      metadata: { signedUrl: async () => ({ data: { url: "https://upload.example/signed" } }), upload: async () => ({ data: { url: "ipfs://meta" } }), ...metadata },
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
  await waitFor(() => expect(view.getByText("Owner only")).toBeTruthy());
});

test("an edition needs an image before anything is created", async () => {
  const { view, intents } = setup(OWNER);
  await waitFor(() => expect(view.getByPlaceholderText("The title of this digital asset")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("The title of this digital asset"), { target: { value: "Track" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByRole("group").textContent).toContain("Upload an image first."));
  expect(intents).toEqual([]);
});

test("an edition is minted with its quantity and links to the new asset", async () => {
  const { view, intents } = setup(OWNER);
  await waitFor(() => expect(view.getByPlaceholderText("The title of this digital asset")).toBeTruthy());
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });
  await waitFor(() => expect(view.getByText("✓ Uploaded")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("The title of this digital asset"), { target: { value: "Track" } });
  fireEvent.change(view.getByPlaceholderText("1"), { target: { value: "25" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Create another")).toBeTruthy());
  expect(intents[0]).toMatchObject({ owner: OWNER, recipient: OWNER, collectionContract: CONTRACT, tokenUri: "ipfs://meta", value: "25", royaltyBps: 0 });
  expect(view.getByText("View NFT").closest("a")?.getAttribute("href")).toBe(`/asset/starknet/${CONTRACT}/4`);
});

test("the typed royalty is sent with the mint", async () => {
  const { view, intents } = setup(OWNER);
  await waitFor(() => expect(view.getByPlaceholderText("The title of this digital asset")).toBeTruthy());
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });
  await waitFor(() => expect(view.getByText("✓ Uploaded")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("The title of this digital asset"), { target: { value: "Track" } });
  fireEvent.click(view.getByText("License terms"));
  fireEvent.click(view.getByText("Advanced options"));
  fireEvent.change(view.getByPlaceholderText("0"), { target: { value: "5" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(intents).toHaveLength(1));
  expect(intents[0]).toMatchObject({ royaltyBps: 500 });
});

function failingUploads() {
  (globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
  (globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};
  return { signedUrl: async () => { throw new Error("Storage limit reached"); } };
}

const pickImage = (view: { container: HTMLElement }) =>
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });

test("a failed picture is reported in the picture field as soon as it happens", async () => {
  const { view, intents } = setup(OWNER, failingUploads());
  await waitFor(() => expect(view.getByPlaceholderText("The title of this digital asset")).toBeTruthy());
  pickImage(view);
  await waitFor(() => expect(view.getByRole("group").textContent).toContain("Image upload failed: Storage limit reached"));
  expect(view.getAllByRole("alert")).toHaveLength(1);
  expect(view.getByText("Retry")).toBeTruthy();
  expect(intents).toEqual([]);
});

test("the edition form names the collection instead of showing its address", async () => {
  const { view } = setup(OWNER);
  await waitFor(() => expect(view.getByText("Night Songs")).toBeTruthy());
  expect(view.container.textContent).not.toContain(CONTRACT);
});

test("an unnamed collection adds no header line", async () => {
  const { view } = setup(OWNER, {}, null);
  await waitFor(() => expect(view.getByPlaceholderText("The title of this digital asset")).toBeTruthy());
  expect(view.container.textContent).not.toContain(CONTRACT);
  expect(view.queryByTestId("collection-name")).toBeNull();
});
