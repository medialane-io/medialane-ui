import { afterEach, expect, test, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost:3000" });

mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
const { MotionGlobalConfig } = await import("framer-motion");
MotionGlobalConfig.skipAnimations = true;
globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: {} } }))) as unknown as typeof fetch;

const { cleanup, render, waitFor } = await import("@testing-library/react");
const { SWRConfig } = await import("swr");
const { AssetPage, detectAssetKind } = await import("./asset-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");
import type { ApiCollection, ApiToken } from "@medialane/sdk";
import type { AssetPageSlots } from "./asset-page.js";
import type { MedialaneApp } from "./medialane-app.js";

afterEach(() => cleanup());

const token = (over: Partial<ApiToken> = {}) =>
  ({
    chain: "STARKNET",
    contractAddress: "0xc0",
    tokenId: "1",
    standard: "ERC721",
    owner: "0xowner",
    metadata: { name: "Stones", description: "We could be heroes", image: null, attributes: [] },
    ...over,
  }) as unknown as ApiToken;

const collection = (over: Partial<ApiCollection> = {}) =>
  ({ chain: "STARKNET", contractAddress: "0xc0", name: "Heroes", standard: "ERC721", service: null, ...over }) as unknown as ApiCollection;

const clientFor = (t: ApiToken, c: ApiCollection) => ({
  api: new Proxy(
    {
      getToken: async () => ({ data: t }),
      getCollection: async () => ({ data: c }),
      getTicket: async () => ({ maxSupply: "500", minted: "407", startTime: null, endTime: null, royaltyBps: 0 }),
      getIpNftTokenData: async () => null,
      getTokenBalance: async () => ({ data: { owner: "0xme", amount: "0" } }),
    } as Record<string, unknown>,
    { get: (target, key: string) => target[key] ?? (async () => ({ data: [], meta: { total: 0 } })) },
  ),
});

const opened: string[] = [];
const slots: AssetPageSlots = {
  useMarketActions: () => ({
    isProcessing: false,
    buy: () => opened.push("buy"),
    list: () => opened.push("list"),
    offer: () => opened.push("offer"),
    transfer: () => opened.push("transfer"),
    cancel: () => {},
    acceptBid: () => {},
    dialogs: <div>app dialogs</div>,
  }),
  Comments: () => <div>app comments</div>,
  PopBurn: () => <div>app burn</div>,
};

const renderPage = (t: ApiToken, c: ApiCollection) => {
  const app = { getClient: () => clientFor(t, c), getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as unknown as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MedialaneAppProvider value={app}>
        <AssetPage contract="0xc0" tokenId="1" slots={slots} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
};

test("asset kind comes from the collection's service, then the token standard", () => {
  expect(detectAssetKind("ip-tickets", "ERC1155")).toBe("ticket");
  expect(detectAssetKind("ip-club", "ERC1155")).toBe("membership");
  expect(detectAssetKind(null, "ERC1155")).toBe("edition");
  expect(detectAssetKind(null, "ERC721")).toBe("standard");
});

test("a standard asset shows the header, marketplace and the app's slots", async () => {
  const { getByText, queryByText } = renderPage(token(), collection());
  await waitFor(() => expect(getByText("Stones")).toBeTruthy());
  expect(getByText("We could be heroes")).toBeTruthy();
  expect(getByText("Markets")).toBeTruthy();
  expect(getByText("app dialogs")).toBeTruthy();
  expect(queryByText("Ticket")).toBeNull();
});

test("a ticket shows its ticket panel", async () => {
  const { getByText, queryByText } = renderPage(token({ standard: "ERC1155" }), collection({ standard: "ERC1155", service: "ip-tickets" }));
  await waitFor(() => expect(getByText("Ticket")).toBeTruthy());
  expect(queryByText(/valid/i)).toBeNull();
});

test("a POP has no marketplace", async () => {
  const { getByText, queryByText } = renderPage(token(), collection({ service: "pop-protocol" }));
  await waitFor(() => expect(getByText("Stones")).toBeTruthy());
  expect(getByText("POP")).toBeTruthy();
  expect(queryByText("Markets")).toBeNull();
});
