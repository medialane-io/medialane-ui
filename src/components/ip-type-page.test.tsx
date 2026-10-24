import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/nft", useSearchParams: () => new URLSearchParams() }));
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } } as unknown as typeof IntersectionObserver;

const { IpTypePage } = await import("./ip-type-page.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const C = "0x00000000000000000000000000000000000000000000000000000000000000c1";

const token = (id: string, owner: string, listed: boolean) => ({
  id, chain: "STARKNET", contractAddress: C, tokenId: id, owner, tokenUri: null, metadataStatus: "FETCHED", standard: "ERC721",
  metadata: { name: `Work ${id}`, image: null, ipType: "NFT", attributes: [] },
  activeOrders: listed ? [{ orderHash: `h${id}`, offer: { itemType: "ERC721" }, price: { formatted: "5", currency: "USDC" } }] : [],
});

function setup(tokens: unknown[], walletAddress = ME) {
  const bought: unknown[] = [];
  const offered: unknown[] = [];
  const client = { api: { tokens: { list: async () => ({ data: tokens, meta: { page: 1, limit: 24, total: tokens.length } }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress, onRequireWallet: () => {} } as MedialaneApp;
  const useMarketActions = () => ({ buy: (o: unknown) => { bought.push(o); }, offer: (t: unknown) => { offered.push(t); }, dialogs: <p>market dialogs</p> });
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <IpTypePage slug="nft" useMarketActions={useMarketActions} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, bought, offered };
}

test("shows the type with its asset and market counts", async () => {
  const { view } = setup([token("1", OTHER, true), token("2", OTHER, false)]);
  await waitFor(() => expect(view.getByText("2 assets · 1 market")).toBeTruthy());
  expect(view.getByText("market dialogs")).toBeTruthy();
});

test("a listed asset can be bought and any asset offered on, unless it is yours", async () => {
  const { view, bought, offered } = setup([token("1", OTHER, true), token("2", ME, true)]);
  await waitFor(() => expect(view.getAllByText("Work 1").length).toBeGreaterThan(0));
  fireEvent.click(view.getAllByText("Buy")[0]!);
  expect(bought.length).toBe(1);
  expect(view.getAllByText("Buy").length).toBe(1);
  expect(view.queryAllByText("Offer").length).toBe(0);
  expect(offered).toEqual([]);
});
