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
const { CollectionPage, canTransferCollectionOwnership } = await import("./collection-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");
import type { ApiCollection, ApiToken } from "@medialane/sdk";
import type { CollectionPageSlots } from "./collection-page.js";
import type { MedialaneApp } from "./medialane-app.js";

afterEach(() => cleanup());

const collection = (over: Partial<ApiCollection> = {}) =>
  ({
    chain: "STARKNET", contractAddress: "0xc0", name: "Heroes", standard: "ERC721", service: "mip-erc721",
    owner: "0xowner", totalSupply: 2, holderCount: 1, floorPrice: null, totalVolume: null, collectionId: "7", createdAt: "2026-06-01",
    ...over,
  }) as unknown as ApiCollection;

const token = (id: string) =>
  ({ chain: "STARKNET", contractAddress: "0xc0", tokenId: id, standard: "ERC721", metadata: { name: `Hero ${id}`, image: null, attributes: [] } }) as unknown as ApiToken;

const slots: CollectionPageSlots = {
  useMarketActions: () => ({ buy: () => {}, offer: () => {}, dialogs: <div>app dialogs</div> }),
  useGatedContent: () => ({ status: "signed_out" }),
  ServiceAction: () => <div>app service action</div>,
  TransferOwnership: () => <div>app transfer</div>,
};

const renderPage = (c: ApiCollection, tokens: ApiToken[], walletAddress: string | null) => {
  const client = {
    api: new Proxy(
      {
        getCollection: async () => ({ data: c }),
        getCollectionTokens: async () => ({ data: tokens, meta: { total: tokens.length } }),
        getCollectionProfile: async () => null,
      } as Record<string, unknown>,
      { get: (target, key: string) => target[key] ?? (async () => ({ data: [], meta: { total: 0 } })) },
    ),
  };
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress, onRequireWallet: () => {} } as unknown as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MedialaneAppProvider value={app}>
        <CollectionPage contract="0xc0" slots={slots} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
};

test("ownership transfer follows the v3 registry cutover", () => {
  expect(canTransferCollectionOwnership(collection())).toBe(true);
  expect(canTransferCollectionOwnership(collection({ createdAt: "2026-05-01" }))).toBe(false);
  expect(canTransferCollectionOwnership(collection({ standard: "ERC1155" }))).toBe(false);
});

test("a visitor sees the header, the items and the app's service action", async () => {
  const { getByText, queryByText } = renderPage(collection(), [token("1"), token("2")], null);
  await waitFor(() => expect(getByText("Hero 1")).toBeTruthy());
  expect(getByText("app service action")).toBeTruthy();
  expect(queryByText("Settings")).toBeNull();
  expect(queryByText("app transfer")).toBeNull();
});

test("the owner of an empty collection gets the mint link and owner tools", async () => {
  const { getByText } = renderPage(collection(), [], "0xowner");
  await waitFor(() => expect(getByText("Mint your first work")).toBeTruthy());
  expect(getByText("Settings")).toBeTruthy();
  expect(getByText("app transfer")).toBeTruthy();
});
