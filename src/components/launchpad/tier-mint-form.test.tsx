import { afterAll, afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
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

const { TierMintForm } = await import("./tier-mint-form.js");
const { CLUB_TIER_PRESET } = await import("./tier-mint-presets.js");

afterEach(() => cleanup());

const OWNER = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const CONTRACT = "0x00000000000000000000000000000000000000000000000000000000000000c1";

function setup(collectionOwner = OWNER) {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const executed: { calls: unknown[]; opts: unknown }[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
      collections: { get: async () => ({ owner: collectionOwner, name: "Rio Club", symbol: "RIO" }) },
      chainReads: { clubMembershipCount: async () => 4 },
      metadata: {
        signedUrl: async () => ({ data: { url: "https://upload.example/signed" } }),
        upload: async () => ({ data: { url: "ipfs://meta" } }),
      },
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => {
          intents.push({ kind, params });
          return { id: `i-${kind}`, requiresSignature: false, calls: [{ kind }] };
        },
        syncTransaction: async () => ({ pending: false }),
      },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: OWNER, execute: async (calls: unknown[], opts: unknown) => { executed.push({ calls, opts }); return { txHash: "0xabc" }; }, signTypedData: async () => [] }),
    walletAddress: OWNER,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <TierMintForm contract={CONTRACT} preset={CLUB_TIER_PRESET} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents, executed };
}

test("someone who does not own the club is told so", async () => {
  const { view } = setup("0x00000000000000000000000000000000000000000000000000000000000000bb");
  await waitFor(() => expect(view.getByText("You don't own this club.")).toBeTruthy());
});

test("a membership needs an image before anything is created", async () => {
  const { view, intents } = setup();
  await waitFor(() => expect(view.getByPlaceholderText("Kalamaha Fan Club — 2026 Season Pass")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("Kalamaha Fan Club — 2026 Season Pass"), { target: { value: "Season Pass" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Add a membership image.")).toBeTruthy());
  expect(intents).toEqual([]);
});

test("a membership is created and minted in one transaction for the next tier id", async () => {
  const { view, intents, executed } = setup();
  await waitFor(() => expect(view.getByPlaceholderText("Kalamaha Fan Club — 2026 Season Pass")).toBeTruthy());
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "pass.png", { type: "image/png" })] } });
  await waitFor(() => expect(view.getByText("✓ Uploaded")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("Kalamaha Fan Club — 2026 Season Pass"), { target: { value: "Season Pass" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Create another membership")).toBeTruthy());
  expect(intents.map((i) => i.kind)).toEqual(["create-tier", "mint"]);
  expect(intents[0]!.params).toMatchObject({ service: "ip-club", maxSupply: "100", metadataUri: "ipfs://meta" });
  expect(intents[1]!.params).toMatchObject({ tokenId: "5", amount: "100" });
  expect(executed[0]).toEqual({ calls: [{ kind: "create-tier" }, { kind: "mint" }], opts: { intentIds: ["i-create-tier", "i-mint"] } });
  expect(view.getByText("View collection").closest("a")?.getAttribute("href")).toContain("c1");
});
