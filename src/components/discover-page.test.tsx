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

test("discover shows a Featured strip of featured collections before Collections", async () => {
  const col = (address: string, name: string) => ({ contractAddress: address, name, chain: "STARKNET", symbol: "X", owner: ME, totalSupply: 1, collectionId: null, image: null, floorPrice: null, startBlock: "0", isFeatured: true }) as never;
  const calls: Array<boolean | undefined> = [];
  const collectionsList = async (q: { isFeatured?: boolean }) => {
    calls.push(q.isFeatured);
    return { data: q.isFeatured ? [col("0xf1", "Featured One")] : [col("0xc2", "Plain Two")], meta: { page: 1, limit: 8, total: 1 } };
  };
  const empty = async () => ({ data: [], meta: { page: 1, limit: 10, total: 0 } });
  const client = { api: { platform: { stats: async () => ({ collections: 1, tokens: 2, sales: 3 }) }, orders: { list: empty }, collections: { list: collectionsList }, activity: { list: empty }, creators: { list: empty }, rewards: { leaderboard: empty, batch: async () => ({ data: [] }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {} } as MedialaneApp;
  const useMarketActions = () => ({ buy: () => {}, offer: () => {}, dialogs: null });
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><DiscoverPage useMarketActions={useMarketActions} /></MedialaneAppProvider></SWRConfig>);
  await waitFor(() => expect(view.getAllByText("Featured One").length).toBeGreaterThan(0));
  await waitFor(() => expect(view.getAllByText("Plain Two").length).toBeGreaterThan(0));
  expect(calls).toContain(true);
  const featuredHeading = view.getByRole("heading", { name: "Featured" });
  const collectionsHeading = view.getByRole("heading", { name: "Collections" });
  expect(featuredHeading.compareDocumentPosition(collectionsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("discover's Activities and Rewards cards share a header layout and ask for five rows each", async () => {
  const activityQueries: Array<{ limit?: number }> = [];
  const leaderboardCalls: unknown[][] = [];
  const empty = async () => ({ data: [], meta: { page: 1, limit: 10, total: 0 } });
  const client = { api: { platform: { stats: async () => ({ collections: 1, tokens: 2, sales: 3 }) }, orders: { list: empty }, collections: { list: empty }, activity: { list: async (q: { limit?: number }) => { activityQueries.push(q); return { data: [], meta: { page: 1, limit: 5, total: 0 } }; } }, creators: { list: empty }, rewards: { leaderboard: async (...a: unknown[]) => { leaderboardCalls.push(a); return { data: [], meta: { page: 1, limit: 5, total: 0 } }; }, batch: async () => ({ data: [] }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {} } as MedialaneApp;
  const useMarketActions = () => ({ buy: () => {}, offer: () => {}, dialogs: null });
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><DiscoverPage useMarketActions={useMarketActions} /></MedialaneAppProvider></SWRConfig>);
  await waitFor(() => expect(activityQueries.length).toBeGreaterThan(0));
  expect(activityQueries[0]?.limit).toBe(5);
  await waitFor(() => expect(leaderboardCalls.length).toBeGreaterThan(0));
  expect(JSON.stringify(leaderboardCalls[0])).toContain("5");
  const activities = view.getByRole("heading", { name: "Activities" }).closest("section")!;
  const rewards = view.getByRole("heading", { name: "Rewards" }).closest("section")!;
  expect(activities.className).toBe(rewards.className);
  expect(view.getByText("Earn XP. Share the Creator's Fund.")).toBeTruthy();
  const features = view.getByRole("heading", { name: "Medialane features" }).closest("section")!;
  expect(rewards.compareDocumentPosition(features) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
