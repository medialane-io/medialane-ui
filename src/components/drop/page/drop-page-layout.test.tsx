import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { DropOnchain } from "@medialane/sdk/starknet";

const onchain: DropOnchain = {
  organizer: "0x1", startTime: 0, endTime: 0, price: 0n, paymentToken: "0x0",
  maxPerWallet: 0n, allowlistRoot: "0x0", maxSupply: 100n, totalMinted: 10n,
};

mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {}, back: () => {} }) }));
mock.module("../../../utils/use-drops.js", () => ({
  useDrop: () => ({ drop: { name: "Neon", baseUri: null, description: "", image: null }, isLoading: false }),
  useDropChain: () => ({ drop: onchain, claimed: 0n, balance: 0n, mutate: async () => {} }),
  useDropMints: () => ({ mints: [], mutate: async () => {} }),
  useDropFee: () => 0,
  useDropFile: () => null,
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
