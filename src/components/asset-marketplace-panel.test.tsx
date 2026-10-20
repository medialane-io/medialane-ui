import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Mail } from "lucide-react";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { AssetMarketplacePanel } = await import("./asset-marketplace-panel.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

const base = { getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
const companion = {
  title: "Open in the other app",
  description: "Same asset, other app.",
  icon: Mail,
  origin: "https://other.example",
};
const noop = () => {};

const listing = { orderHash: "0x1", offerer: "0xseller", endTime: "2999-01-01T00:00:00Z", price: { formatted: "119", currency: "STRK" } };

const render = (app0: MedialaneApp, isSignedIn: boolean, extra: { cheapest?: typeof listing; myListing?: typeof listing | null; isOwner?: boolean } = {}) =>
  renderToStaticMarkup(
    <MedialaneAppProvider value={{ ...app0, walletAddress: isSignedIn ? "0xme" : null }}>
      <AssetMarketplacePanel
        asset={{ chain: "STARKNET", contractAddress: "0xabc", tokenId: "7" }}
        cheapest={extra.cheapest}
        usdValue="$6.66"
        isOwner={extra.isOwner ?? false}
        isProcessing={false}
        isERC1155={false}
        myListing={extra.myListing ?? null}
        activeBids={[]}
        onCancelClick={noop}
        onAcceptBid={noop}
        onOpenListing={noop}
        onOpenTransfer={noop}
        onOpenPurchase={noop}
        onOpenOffer={noop}
      />
    </MedialaneAppProvider>,
  );

test("signed out shows the app's sign-in card and the companion app link", () => {
  const html = render({ ...base, connectLabel: "Set up account", connectDescription: "No seed phrase needed.", companion }, false);
  expect(html).toContain("Set up account");
  expect(html).toContain("No seed phrase needed.");
  expect(html).toContain("https://other.example/asset/starknet/0xabc/7");
  expect(html).not.toContain("Make offer");
});

test("signed out without a companion shows only the sign-in card", () => {
  const html = render(base, false);
  expect(html).toContain("Sign in");
  expect(html).not.toContain("https://other.example");
});

test("signed in shows the actions and keeps the companion app link", () => {
  const html = render({ ...base, companion }, true);
  expect(html).toContain("Make offer");
  expect(html).not.toContain("Sign in");
  expect(html).toContain("https://other.example/asset/starknet/0xabc/7");
});

test("a listed asset's price sits in the Buy button", () => {
  const html = render(base, true, { cheapest: listing });
  expect(html).toContain("Buy for");
  expect(html).toContain("119");
  expect(html).toContain("≈ $6.66");
  expect(html).toContain("Make offer");
});

test("the owner sees what they listed it for", () => {
  const html = render(base, true, { cheapest: listing, myListing: listing, isOwner: true });
  expect(html).toContain("Listed for");
  expect(html).toContain("Cancel listing");
  expect(html).not.toContain("Buy for");
});

test("signed out shows the price above the sign-in cards", () => {
  const html = render(base, false, { cheapest: listing });
  expect(html).toContain("Price");
  expect(html).toContain("119");
  expect(html).not.toContain("Buy for");
});
