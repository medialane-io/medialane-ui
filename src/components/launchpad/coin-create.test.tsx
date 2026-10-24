import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { hash } from "starknet";
import { getStarknetCoordinates } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { CoinCreate } = await import("./coin-create.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const COIN = "0x00000000000000000000000000000000000000000000000000000000000000d9";

function setup() {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const executed: string[] = [];
  const factory = getStarknetCoordinates("STARKNET").creatorCoinFactory;
  const client = {
    provider: {
      getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [{ from_address: factory, keys: [hash.getSelectorFromName("CreatorCoinCreated")], data: [ME, COIN] }] }),
      callContract: async () => ["0xffffffffffffffffffffffff", "0x0"],
    },
    api: {
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => { intents.push({ kind, params }); return { id: `i-${kind}`, requiresSignature: false, calls: [{ kind }] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      coins: { sync: async () => ({}) },
      collections: { updateProfile: async () => ({}) },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: ME, execute: async (calls: unknown[]) => { executed.push((calls[0] as { kind: string }).kind); return { txHash: `0x${executed.length}` }; }, signTypedData: async () => [] }),
    walletAddress: ME,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <MedialaneAppProvider value={app}>
      <CoinCreate tradeHref={(address) => `/coins/starknet/${address}`} />
    </MedialaneAppProvider>,
  );
  return { view, intents, executed };
}

test("a coin is deployed, then its market is opened with the locked liquidity", async () => {
  const { view, intents, executed } = setup();
  fireEvent.change(view.getByPlaceholderText("My Coin"), { target: { value: "Rio Coin" } });
  fireEvent.click(view.getByText("1M"));
  fireEvent.click(view.getByText("Launch your coin"));
  await waitFor(() => expect(view.getByText("Your coin is live")).toBeTruthy());
  expect(intents.map((i) => i.kind)).toEqual(["create-coin", "launch-coin"]);
  expect(executed).toEqual(["create-coin", "launch-coin"]);
  expect(intents[0]!.params).toMatchObject({ name: "Rio Coin", initialSupply: expect.any(String) });
  expect(intents[1]!.params).toMatchObject({ creatorCoin: COIN });
  expect(view.getByText("View & trade your coin").closest("a")?.getAttribute("href")).toBe(`/coins/starknet/${COIN}`);
});

test("a coin cannot be launched until it has a name and a supply", async () => {
  const { view, intents } = setup();
  fireEvent.click(view.getByText("Launch your coin"));
  await new Promise((r) => setTimeout(r, 30));
  expect(intents).toEqual([]);
});
