import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiToken } from "@medialane/sdk";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { TokenCard } = await import("./token-card.js");

const token = (listed: boolean) => ({
  chain: "STARKNET", contractAddress: "0xc1", tokenId: "7", owner: "0xo", standard: "ERC721", metadata: { name: "Loop", image: null },
  activeOrders: listed ? [{ orderHash: "o1", offer: { itemType: "ERC721" }, price: { formatted: "1", currency: "STRK" } }] : [],
}) as unknown as ApiToken;

test("a visitor's card without handlers shows View instead of dead Buy or Offer buttons", () => {
  for (const listed of [false, true]) {
    const html = renderToStaticMarkup(<TokenCard token={token(listed)} />);
    expect(html).not.toContain(">Offer<");
    expect(html).not.toContain(">Buy<");
    expect(html).toContain("View");
  }
});

test("a visitor's card shows Offer and Buy when the app handles them", () => {
  expect(renderToStaticMarkup(<TokenCard token={token(false)} onOffer={() => {}} />)).toContain("Offer");
  expect(renderToStaticMarkup(<TokenCard token={token(true)} onBuy={() => {}} />)).toContain("Buy");
});
