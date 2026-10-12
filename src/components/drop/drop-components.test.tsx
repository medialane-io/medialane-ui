import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getTokenBySymbol, type ApiDrop } from "@medialane/sdk";
import { DropCard, DropGrid } from "./drop-card.js";
import { DropTokenLink } from "./drop-token-link.js";

const NOW = 1_800_000_000;
const drop = (over: Partial<ApiDrop> = {}): ApiDrop => ({
  contractAddress: "0xd409", dropId: "1", organizer: "0x1", name: "Neon Tides", symbol: "NEON", description: null,
  image: "ipfs://img", baseUri: "ipfs://cid/", maxSupply: "500", minted: "310", revenue: "0", collectors: 3,
  terms: { startTime: 0, endTime: 0, price: "5000000", paymentToken: getTokenBySymbol("USDC")!.address, maxPerWallet: "0" },
  allowlistRoot: "0x0", createdBlock: "1", ...over,
});

test("a drop card shows name, status, price and supply, linking to the drop", () => {
  const html = renderToStaticMarkup(<DropCard drop={drop()} now={NOW} />);
  expect(html).toContain("Neon Tides");
  expect(html).toContain("Live");
  expect(html).toContain("5 USDC");
  expect(html).toContain("310 / 500 minted");
  expect(html).toContain('href="/launchpad/drop/0xd409"');
});

test("a card for its organizer links to Manage; a sold-out drop says so", () => {
  expect(renderToStaticMarkup(<DropCard drop={drop()} now={NOW} manage />)).toContain('href="/launchpad/drop/0xd409?tab=manage"');
  expect(renderToStaticMarkup(<DropCard drop={drop({ minted: "500" })} now={NOW} />)).toContain("Sold out");
});

test("a grid renders one card per drop", () => {
  const html = renderToStaticMarkup(<DropGrid drops={[drop(), drop({ contractAddress: "0xd410", name: "Second" })]} now={NOW} />);
  expect(html).toContain("Second");
});

test("the token page link names the drop", () => {
  const html = renderToStaticMarkup(<DropTokenLink contract="0xd409" name="Neon Tides" />);
  expect(html).toContain("From the drop");
  expect(html).toContain("Neon Tides");
  expect(html).toContain("View drop");
});
