import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/collections", useSearchParams: () => new URLSearchParams() }));
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } } as unknown as typeof IntersectionObserver;

const { CollectionsPage } = await import("./collections-page.js");

afterEach(() => cleanup());

const collection = { id: "1", chain: "STARKNET", contractAddress: "0x00000000000000000000000000000000000000000000000000000000000000c1", name: "Rio Drummers", symbol: "RIO", totalSupply: 4, image: null, metadataStatus: "FETCHED", createdAt: "2026-01-01", profile: null };

function setup() {
  const queries: Record<string, unknown>[] = [];
  const client = {
    api: {
      platform: { stats: async () => ({ collections: 1, tokens: 4, sales: 0 }) },
      collections: { list: async (q: Record<string, unknown>) => { queries.push(q); return { data: [collection], meta: { page: 1, limit: 18, total: 1 } }; } },
    },
  } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <CollectionsPage />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, queries };
}

test("lists the collections with their count", async () => {
  const { view } = setup();
  await waitFor(() => expect(view.getAllByText("Rio Drummers").length).toBeGreaterThan(0));
  expect(view.getByText("Onchain Collections")).toBeTruthy();
});

test("the Drops filter asks for drop collections", async () => {
  const { view, queries } = setup();
  await waitFor(() => expect(view.getAllByText("Rio Drummers").length).toBeGreaterThan(0));
  fireEvent.click(view.getByText("Filters"));
  fireEvent.click(await view.findByText("Drops"));
  await waitFor(() => expect(queries.some((q) => q.service === "drop-collection")).toBe(true));
  expect(queries.find((q) => q.service === "drop-collection")).toMatchObject({ standard: "ERC721,ERC1155" });
});
