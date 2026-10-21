import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { AssetCollectionBar } = await import("./asset-collection-bar.js");

const props = { collectionName: "World Cup 2026", collectionImage: null, collectionHref: "/collections/starknet/0xc1", currentTokenId: "1", siblingTokens: [], onNavigate: () => {} };

test("the collection card shows the floor price", () => {
  const html = renderToStaticMarkup(<AssetCollectionBar {...props} floorPriceRaw="3 STRK" />);
  expect(html).toContain("World Cup 2026");
  expect(html).toContain("Floor");
});

test("no floor, no floor label", () => {
  expect(renderToStaticMarkup(<AssetCollectionBar {...props} />)).not.toContain("Floor");
});
