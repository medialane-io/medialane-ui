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
      search: async () => ({ data: { tokens: [], creators: [], collections: [{ ...collection, name: "Rio Search Hit" }] } }),
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

test("shows how many collections are single NFTs and multi editions", async () => {
  const { view, queries } = setup();
  await waitFor(() => expect(view.getByText("Single NFTs")).toBeTruthy());
  expect(view.getByText("Multi editions")).toBeTruthy();
  expect(queries).toContainEqual(expect.objectContaining({ standard: "ERC721", hideEmpty: true, limit: 1 }));
  expect(queries).toContainEqual(expect.objectContaining({ standard: "ERC1155", hideEmpty: true, limit: 1 }));
});

test("sort is a visible control, not inside the filters dialog", async () => {
  const { view } = setup();
  await waitFor(() => expect(view.getAllByText("Rio Drummers").length).toBeGreaterThan(0));
  expect(view.getByLabelText("Sort collections")).toBeTruthy();
});

test("searching shows matching collections", async () => {
  const { view } = setup();
  fireEvent.change(view.getByLabelText("Search collections"), { target: { value: "rio" } });
  await waitFor(() => expect(view.getByText("Rio Search Hit")).toBeTruthy());
});

test("a featured section comes before the main grid", async () => {
  const { view, queries } = setup();
  await waitFor(() => expect(view.getByText("Featured")).toBeTruthy());
  expect(queries).toContainEqual(expect.objectContaining({ isFeatured: true, hideEmpty: true, limit: 8 }));
});

test("the Drops filter asks for drop collections", async () => {
  const { view, queries } = setup();
  await waitFor(() => expect(view.getAllByText("Rio Drummers").length).toBeGreaterThan(0));
  fireEvent.click(view.getByText("Filters"));
  fireEvent.click(await view.findByText("Drops"));
  await waitFor(() => expect(queries.some((q) => q.service === "drop-collection")).toBe(true));
  expect(queries.find((q) => q.service === "drop-collection")).toMatchObject({ standard: "ERC721,ERC1155" });
});
