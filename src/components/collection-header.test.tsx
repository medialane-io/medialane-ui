import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiCollection } from "@medialane/sdk";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { CollectionHeader } = await import("./collection-header.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

const app = { getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
const collection = {
  chain: "STARKNET",
  contractAddress: "0xabc",
  name: "Ambrosia",
  symbol: "AMBROSIA",
  description: "Cultura colaborativa",
  image: "https://example.com/a.png",
  owner: null,
  standard: "ERC721",
  floorPrice: null,
  totalVolume: "300 STRK",
  holderCount: 501,
  totalSupply: 2085,
} as unknown as ApiCollection;

const render = (c: ApiCollection | null, loading = false) =>
  renderToStaticMarkup(
    <MedialaneAppProvider value={app}>
      <CollectionHeader collection={c} loading={loading} onReportClick={() => {}}>
        <span>owner actions</span>
      </CollectionHeader>
    </MedialaneAppProvider>,
  );

test("shows the collection beside its image", () => {
  const html = render(collection);
  expect(html).toContain("Ambrosia");
  expect(html).toContain("Single NFT");
  expect(html).toContain("AMBROSIA");
  expect(html).toContain("Cultura colaborativa");
  expect(html).toContain("2,085");
  expect(html).toContain("501");
  expect(html).toContain("Volume");
  expect(html).toContain("owner actions");
});

test("floor is hidden when there is none", () => {
  expect(render(collection)).not.toContain("Floor");
});

test("loading shows a skeleton", () => {
  expect(render(null, true)).not.toContain("Ambrosia");
});
