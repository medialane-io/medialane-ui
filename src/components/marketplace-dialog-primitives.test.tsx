import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { MedialaneAppContext } from "./medialane-app.js";
import { ListingAssetSummary, MarketplaceDialogHero } from "./marketplace-dialog-primitives.js";

afterEach(cleanup);

const IPFS = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/1.png";

function withResolver(resolveImage: (uri: string | null | undefined) => string | null, children: React.ReactNode) {
  return <MedialaneAppContext.Provider value={{ resolveImage } as never}>{children}</MedialaneAppContext.Provider>;
}

test("the dialog hero passes the token image through the app's image resolver", () => {
  const resolve = mock((uri: string | null | undefined) => (uri ? `https://gateway.test/${uri.slice(7)}` : null));
  render(withResolver(resolve, <MarketplaceDialogHero tokenImage={IPFS} tokenId="1" fallbackIcon={null} />));
  expect(resolve).toHaveBeenCalledWith(IPFS);
});

test("the listing summary passes its image through the resolver too", () => {
  const resolve = mock((uri: string | null | undefined) => uri ?? null);
  render(withResolver(resolve, <ListingAssetSummary name="a" image={IPFS} fallbackIcon={null} />));
  expect(resolve).toHaveBeenCalledWith(IPFS);
});
