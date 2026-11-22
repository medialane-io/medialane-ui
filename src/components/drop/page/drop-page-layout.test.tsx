import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { DropOnchain } from "@medialane/sdk/starknet";

const onchain: DropOnchain = {
  organizer: "0x1", startTime: 0, endTime: 0, price: 0n, paymentToken: "0x0",
  maxPerWallet: 0n, allowlistRoot: "0x0", maxSupply: 100n, totalMinted: 10n,
};

mock.module("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {}, back: () => {} }) }));
mock.module("../../../utils/use-drops.js", () => ({
  useDrop: () => ({ drop: { name: "Neon", baseUri: "ipfs://base/", description: "", image: "https://cdn.test/cover.png" }, isLoading: false }),
  useDropChain: () => ({ drop: onchain, claimed: 0n, balance: 0n, mutate: async () => {} }),
  useDropMints: () => ({ mints: [], mutate: async () => {} }),
  useDropFee: () => 0,
  useDropFile: (_base: string | null, name: string) => (name === "1" ? { image: "https://cdn.test/token-1.png" } : null),
}));
mock.module("../../../utils/use-collections.js", () => ({ useCollectionTokens: () => ({ tokens: [] }) }));

const { DropPage } = await import("./drop-page.js");
const { MedialaneAppProvider } = await import("../../medialane-app.js");

afterEach(() => cleanup());

test("the drop page has no fixed elements and one mint button", () => {
  const view = render(
    <MedialaneAppProvider value={{ getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("not used"); }, walletAddress: null, onRequireWallet: () => {} }}>
      <DropPage contract="0x2" />
    </MedialaneAppProvider>,
  );
  expect(view.container.querySelector(".fixed")).toBeNull();
  expect(view.getAllByRole("button", { name: "Sign in to mint" })).toHaveLength(1);
});

test("the main image is the collection's feature image, not token #1", () => {
  const view = render(
    <MedialaneAppProvider value={{ getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("not used"); }, walletAddress: null, onRequireWallet: () => {} }}>
      <DropPage contract="0x2" />
    </MedialaneAppProvider>,
  );
  const src = view.getByAltText("Neon").getAttribute("src") ?? "";
  expect(src).toContain("cover.png");
  expect(src).not.toContain("token-1");
});
