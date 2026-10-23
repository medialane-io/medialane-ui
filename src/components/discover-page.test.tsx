import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ApiOrder } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/discover", useSearchParams: () => new URLSearchParams() }));

const { DiscoverPage } = await import("./discover-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const listing = (h: string, offerer: string) => ({
  orderHash: h, offerer, status: "ACTIVE", chain: "STARKNET", nftContract: "0xc1", nftTokenId: h,
  offer: { itemType: "ERC721", token: "0xc1", identifier: h }, consideration: { itemType: "ERC20" },
  price: { formatted: "10", currency: "STRK", raw: "10" }, token: { name: `Piece ${h}`, image: null }, endTime: String(Math.floor(Date.now() / 1000) + 86400),
  txHash: { created: "0x1" }, createdAt: new Date().toISOString(),
}) as unknown as ApiOrder;

test("discover shows the app's hero, the sections, and buys through the app", async () => {
  const empty = async () => ({ data: [], meta: { page: 1, limit: 10, total: 0 } });
  const client = { api: { platform: { stats: async () => ({ collections: 1, tokens: 2, sales: 3 }) }, orders: { list: async () => ({ data: [listing("1", OTHER), listing("2", ME)], meta: { page: 1, limit: 10, total: 2 } }) }, collections: { list: empty }, activity: { list: empty }, creators: { list: empty }, rewards: { leaderboard: empty, batch: async () => ({ data: [] }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {} } as MedialaneApp;
  const bought: string[] = [];
  const useMarketActions = () => ({ buy: (o: ApiOrder) => bought.push(o.orderHash), offer: () => {}, dialogs: <div>app dialogs</div> });
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><DiscoverPage useMarketActions={useMarketActions} heroHeadline="Explore, share & trade" /></MedialaneAppProvider></SWRConfig>);
  await waitFor(() => expect(view.getAllByText("Piece 1").length).toBeGreaterThan(0));
  expect(view.getByText("Browse by Type")).toBeTruthy();
  expect(view.getByText("app dialogs")).toBeTruthy();
  const buys = view.getAllByRole("button").filter((b) => (b.textContent ?? "").trim() === "Buy");
  expect(buys.length).toBe(1);
  fireEvent.click(buys[0]!);
  expect(bought).toEqual(["1"]);
});
