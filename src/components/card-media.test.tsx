import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiActivity, ApiCollection, ApiOrder, ApiToken } from "@medialane/sdk";

mock.module("next/image", () => ({ default: ({ alt, className }: { alt?: string; className?: string }) => <img alt={alt} className={className} /> }));

const { AssetCard } = await import("./asset-card.js");
const { TokenCard } = await import("./token-card.js");
const { ListingCard } = await import("./listing-card.js");
const { CollectionCard } = await import("./collection-card.js");
const { ActivityCard } = await import("./activity-card.js");

const IMG = "https://img.example/a.png";

const cards: Record<string, React.ReactElement> = {
  AssetCard: <AssetCard href="/a" name="Work" image={IMG} />,
  TokenCard: <TokenCard token={{ chain: "STARKNET", contractAddress: "0xc1", tokenId: "7", standard: "ERC721", metadata: { name: "Work", image: IMG }, activeOrders: [] } as unknown as ApiToken} />,
  ListingCard: <ListingCard order={{ orderHash: "o", nftContract: "0xc1", nftTokenId: "7", chain: "STARKNET", offer: { itemType: "ERC721" }, price: { formatted: "1", currency: "STRK" }, token: { name: "Work", image: IMG } } as unknown as ApiOrder} />,
  ListingCardCompact: <ListingCard compact order={{ orderHash: "o", nftContract: "0xc1", nftTokenId: "7", chain: "STARKNET", offer: { itemType: "ERC721" }, price: { formatted: "1", currency: "STRK" }, token: { name: "Work", image: IMG } } as unknown as ApiOrder} />,
  CollectionCard: <CollectionCard collection={{ chain: "STARKNET", contractAddress: "0xc1", name: "Heroes", image: IMG, standard: "ERC721" } as unknown as ApiCollection} />,
  ActivityCard: <ActivityCard activity={{ type: "mint", chain: "STARKNET", nftContract: "0xc1", nftTokenId: "7", timestamp: "2026-01-01T00:00:00Z", token: { name: "Work", image: IMG } } as unknown as ApiActivity} />,
};

for (const [name, card] of Object.entries(cards)) {
  test(`${name} zooms its artwork through the shared card-media class under a group`, () => {
    const html = renderToStaticMarkup(card);
    expect(html).toContain("card-media");
    expect(html).toMatch(/class="[^"]*\bgroup\b/);
    expect(html).not.toMatch(/group-hover:scale|transition-transform duration/);
  });
}

test("the shared stylesheet defines one smooth zoom, only for hover devices without reduced motion", async () => {
  const css = await Bun.file(new URL("../styles/medialane.css", import.meta.url)).text();
  expect(css).toMatch(/\.card-media\s*\{\s*transition: transform 500ms[^}]*opacity 300ms/);
  expect(css).toMatch(/@media \(hover: hover\) and \(prefers-reduced-motion: no-preference\)\s*\{\s*\.group:hover \.card-media \{ transform: scale\(1\.04\); \}/);
});
