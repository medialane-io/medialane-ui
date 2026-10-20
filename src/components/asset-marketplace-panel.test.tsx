import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Mail } from "lucide-react";
import { AssetMarketplacePanel } from "./asset-marketplace-panel.js";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

const base = { getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
const companion = {
  title: "Open in the other app",
  description: "Same asset, other app.",
  icon: Mail,
  origin: "https://other.example",
};
const noop = () => {};

const render = (app: MedialaneApp, isSignedIn: boolean) =>
  renderToStaticMarkup(
    <MedialaneAppProvider value={app}>
      <AssetMarketplacePanel
        asset={{ chain: "STARKNET", contractAddress: "0xabc", tokenId: "7" }}
        isOwner={false}
        isSignedIn={isSignedIn}
        isProcessing={false}
        isERC1155={false}
        myListing={null}
        activeBids={[]}
        renderHelp={() => null}
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
