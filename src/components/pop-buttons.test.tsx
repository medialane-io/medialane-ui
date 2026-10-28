import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { buildPopAllowlist, encodePopClaimFragment } from "@medialane/sdk/starknet";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { PopClaimButton } = await import("./pop-claim-button.js");
const { PopBurnButton } = await import("./pop-burn-button.js");

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const C = "0x00000000000000000000000000000000000000000000000000000000000000c1";

beforeEach(() => window.sessionStorage.clear());
afterEach(() => {
  cleanup();
  window.location.hash = "";
});

function setup(ui: React.ReactNode, opts: { claimed?: boolean; root?: string } = {}) {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const released: number[] = [];
  const client = {
    provider: {
      getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }),
      callContract: async () => [opts.claimed ? "0x1" : "0x0"],
    },
    api: {
      chainReads: { popClaimInfo: async () => ({ root: opts.root ?? "0x0", claimEndTime: 0 }) },
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => { intents.push({ kind, params }); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: ME, execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    releaseSigner: () => { released.push(1); },
    walletAddress: ME,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>{ui}</MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents, released };
}

test("a holder with a valid link claims the credential", async () => {
  const list = buildPopAllowlist([ME]);
  window.location.hash = encodePopClaimFragment(Object.values(list.proofs)[0]!);
  const { view, intents, released } = setup(<PopClaimButton collectionAddress={C} />, { root: list.root });
  fireEvent.click(await view.findByText("Claim credential"));
  await waitFor(() => expect(view.getByText("Credential claimed")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "pop-claim", params: { claimer: ME, collection: C, proof: Object.values(list.proofs)[0]! } });
  expect(released.length).toBe(1);
});

test("nothing is offered when the wallet already holds the credential", async () => {
  const list = buildPopAllowlist([ME]);
  window.location.hash = encodePopClaimFragment(Object.values(list.proofs)[0]!);
  const { view } = setup(<PopClaimButton collectionAddress={C} />, { root: list.root, claimed: true });
  await new Promise((r) => setTimeout(r, 30));
  expect(view.queryByText("Claim credential")).toBeNull();
});

test("removing a credential asks first, then burns it", async () => {
  let burned = 0;
  const { view, intents } = setup(<PopBurnButton collectionAddress={C} tokenId="4" onBurned={() => { burned++; }} />);
  fireEvent.click(view.getByText("Remove from my wallet"));
  expect(intents).toEqual([]);
  fireEvent.click(view.getByText("Remove"));
  await waitFor(() => expect(view.getByText("Removed from your wallet.")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "pop-burn", params: { owner: ME, collection: C, tokenId: "4" } });
  await waitFor(() => expect(burned).toBe(1));
});
