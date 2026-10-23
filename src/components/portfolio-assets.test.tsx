import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ApiToken } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/portfolio/assets", useSearchParams: () => new URLSearchParams() }));

const { PortfolioAssets } = await import("./portfolio-assets.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const token = (id: string, listed: boolean) => ({
  chain: "STARKNET", contractAddress: "0xc1", tokenId: id, owner: ME, standard: "ERC721",
  metadata: { name: `Piece ${id}`, image: null },
  activeOrders: listed ? [{ orderHash: `o${id}`, offer: { itemType: "ERC721" }, price: { formatted: "10", currency: "STRK" } }] : [],
}) as unknown as ApiToken;

function renderGrid(tokens: ApiToken[]) {
  const client = { api: { tokens: { ownedBy: async () => ({ data: tokens, meta: { total: tokens.length } }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {} } as MedialaneApp;
  const calls: string[] = [];
  const useActions = (ctx: { refresh: () => void }) => {
    calls.push(typeof ctx.refresh);
    return { list: (t: ApiToken) => calls.push(`list ${t.tokenId}`), transfer: (t: ApiToken) => calls.push(`transfer ${t.tokenId}`), cancel: (t: ApiToken) => calls.push(`cancel ${t.tokenId}`), dialogs: <div>app dialogs</div> };
  };
  globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: { STRK: 0.5 } } }))) as unknown as typeof fetch;
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><PortfolioAssets address={ME} useActions={useActions} /></MedialaneAppProvider></SWRConfig>);
  return { view, calls };
}

test("owned assets render with the app's dialogs and list through the app", async () => {
  const { view, calls } = renderGrid([token("1", false), token("2", true)]);
  await waitFor(() => expect(view.getByText("Piece 1")).toBeTruthy());
  expect(view.getByText("Piece 2")).toBeTruthy();
  expect(view.getByText("app dialogs")).toBeTruthy();
  expect(calls[0]).toBe("function");
  fireEvent.click(view.getByText("List"));
  expect(calls).toContain("list 1");
});

test("no owned assets shows the empty state", async () => {
  const { view } = renderGrid([]);
  await waitFor(() => expect(view.getByText("No assets yet")).toBeTruthy());
});
