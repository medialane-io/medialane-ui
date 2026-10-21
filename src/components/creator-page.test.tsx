import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ApiToken } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp, ReportTarget } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/creator/drummer", useSearchParams: () => new URLSearchParams() }));

const { CreatorPage } = await import("./creator-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: {} } }))) as unknown as typeof fetch;

afterEach(() => cleanup());

const A = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const token = (id: string) => ({ chain: "STARKNET", contractAddress: "0xc1", tokenId: id, owner: A, standard: "ERC721", metadata: { name: `Piece ${id}`, image: null }, activeOrders: [] }) as unknown as ApiToken;
const order = (h: string, itemType: string) => ({ orderHash: h, offerer: A, status: "ACTIVE", nftContract: "0xc1", nftTokenId: h, offer: { itemType }, consideration: { itemType: "ERC20" }, price: { formatted: "1", currency: "STRK" }, token: { name: `Listed ${h}`, image: null }, endTime: String(Math.floor(Date.now() / 1000) + 9999) });

function renderPage(props: { username?: string; address?: string }, app: Partial<MedialaneApp> = {}, profile: unknown = { walletAddress: A, username: "drummer", name: "Drum Kit", avatarImage: null }) {
  const api: Record<string, unknown> = {
    getCreatorByUsername: async (u: string) => (u === "drummer" ? profile : null),
    getCreatorProfile: async () => profile,
    getTokensByOwner: async () => ({ data: [token("1")], meta: { total: 1 } }),
    getOrdersByUser: async () => ({ data: [order("l1", "ERC721"), order("l2", "ERC1155")] }),
    isCreatorHidden: async () => false,
  };
  const client = { api: new Proxy(api, { get: (t, k: string) => t[k] ?? (async () => ({ data: [], meta: { total: 0 } })) }) } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {}, ...app } as MedialaneApp;
  const calls: string[] = [];
  const useAssetActions = () => ({ list: (t: ApiToken) => calls.push(`list ${t.tokenId}`), transfer: () => {}, cancel: () => {}, dialogs: null });
  const useMarketActions = () => ({ buy: (o: { orderHash: string }) => calls.push(`buy ${o.orderHash}`), offer: (t: ApiToken) => calls.push(`offer ${t.tokenId}`), dialogs: null });
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={value}><CreatorPage {...props} useAssetActions={useAssetActions} useMarketActions={useMarketActions} /></MedialaneAppProvider></SWRConfig>);
  return { view, calls };
}

test("by username shows the profile, assets, and edition and unique listings", async () => {
  const { view } = renderPage({ username: "drummer" });
  await waitFor(() => expect(view.getByText("Piece 1")).toBeTruthy());
  expect(view.getAllByText(/Drum Kit|@drummer/).length).toBeGreaterThan(0);
  fireEvent.click(view.getByRole("button", { name: /Listings/ }));
  await waitFor(() => expect(view.getByText("Listed l2")).toBeTruthy());
  expect(view.getByText("Listed l1")).toBeTruthy();
});

test("an unknown username says it is not found", async () => {
  const { view } = renderPage({ username: "nobody" });
  await waitFor(() => expect(view.getByText("Creator not found")).toBeTruthy());
});

test("the owner can list their own works through the app", async () => {
  const { view, calls } = renderPage({ address: A }, { walletAddress: A });
  await waitFor(() => expect(view.getByText("Piece 1")).toBeTruthy());
  fireEvent.click(view.getByText("List"));
  expect(calls).toEqual(["list 1"]);
});

test("the more menu reports the creator through the app", async () => {
  const reports: ReportTarget[] = [];
  const ReportDialog = ({ open, target }: { open: boolean; target: ReportTarget }) => { if (open) reports.push(target); return null; };
  const { view } = renderPage({ address: A }, { ReportDialog });
  await waitFor(() => expect(view.getByText("Piece 1")).toBeTruthy());
  fireEvent.pointerDown(view.getByRole("button", { name: "More options" }), { button: 0, pointerType: "mouse" });
  fireEvent.click(await view.findByText("Report"));
  await waitFor(() => expect(reports[reports.length - 1]).toEqual(expect.objectContaining({ type: "CREATOR", address: A })));
});

test("a visitor's Offer opens the app's offer", async () => {
  const { view, calls } = renderPage({ address: A });
  await waitFor(() => expect(view.getByText("Piece 1")).toBeTruthy());
  fireEvent.click(view.getAllByText("Offer")[0]!);
  expect(calls).toEqual(["offer 1"]);
});
