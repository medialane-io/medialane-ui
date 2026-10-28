import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { hash } from "starknet";
import { getCoordinates, getService } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { CollectionCreateForm } = await import("./collection-create-form.js");
const { CLUB_PRESET, SINGLE_PRESET } = await import("./collection-create-presets.js");

afterEach(() => cleanup());

const sel = (name: string) => hash.getSelectorFromName(name);

function setup(events: unknown[], ipNft = "0x0") {
  const created: unknown[] = [];
  const client = {
    provider: {
      getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events }),
      callContract: async () => ["0x0", "0x0", "0x0", "0x0", "0x0", "0xaa", ipNft],
    },
    api: {
      metadata: { upload: async () => ({ data: { url: "ipfs://meta" } }) },
      intents: {
        create: async (_kind: string, params: unknown) => {
          created.push(params);
          return { id: "i1", requiresSignature: false, calls: [] };
        },
        syncTransaction: async () => ({ pending: false }),
      },
      collections: { register: async () => ({}) },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: "0xa", execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    walletAddress: "0x00000000000000000000000000000000000000000000000000000000000000aa",
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <MedialaneAppProvider value={app}>
      <CollectionCreateForm preset={CLUB_PRESET} />
    </MedialaneAppProvider>,
  );
  return { view, created, app };
}

function fill(view: ReturnType<typeof render>, name: string, symbol: string) {
  fireEvent.change(view.getByPlaceholderText("My Club"), { target: { value: name } });
  fireEvent.change(view.getByPlaceholderText("CLUB"), { target: { value: symbol } });
  fireEvent.submit(view.container.querySelector("form")!);
}

test("a club is created with its service and offers to create memberships", async () => {
  const factory = getService("ip-club")!.onchain!.STARKNET!.factoryAddress!;
  const { view, created } = setup([{ from_address: factory, keys: [sel("ClubDeployed"), "0xc1ab"], data: [] }]);
  fill(view, "Rio Drummers", "RIO");
  await waitFor(() => expect(view.getByText("Create memberships")).toBeTruthy());
  expect(created[0]).toMatchObject({ name: "Rio Drummers", symbol: "RIO", baseUri: "ipfs://meta", service: "ip-club" });
  expect(view.getByText("Create memberships").closest("a")?.getAttribute("href")).toContain("c1ab");
});

test("a name that is too long is refused without creating anything", async () => {
  const { view, created } = setup([]);
  fill(view, "x".repeat(256), "RIO");
  await new Promise((r) => setTimeout(r, 50));
  expect(created).toEqual([]);
});

test("single-editions links to the new collection by the address its registry holds", async () => {
  const registry = getCoordinates("STARKNET").collection721;
  const client = setup([{ from_address: registry, keys: [sel("CollectionCreated"), "0x7", "0x0"], data: [] }], "0x0bb");
  cleanup();
  const app = client.app;
  const view = render(
    <MedialaneAppProvider value={app}>
      <CollectionCreateForm preset={SINGLE_PRESET} />
    </MedialaneAppProvider>,
  );
  fireEvent.change(view.getByPlaceholderText("My Creative Works"), { target: { value: "Same name" } });
  fireEvent.change(view.getByPlaceholderText("MCW"), { target: { value: "SAME" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("View collection")).toBeTruthy());
  expect(view.getByText("View collection").closest("a")?.getAttribute("href")).toEndWith("0bb");
  const links = Array.from(view.container.ownerDocument.querySelectorAll("a")).map((a) => a.textContent);
  expect(links.indexOf("View collection")).toBeLessThan(links.indexOf("Mint an asset"));
});
