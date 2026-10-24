import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { PopManagePage } = await import("./pop-manage-page.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const C = "0x00000000000000000000000000000000000000000000000000000000000000c1";

function setup(owner: string) {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
      collections: { get: async () => ({ contractAddress: C, name: "Meetup", owner }) },
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => { intents.push({ kind, params }); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: ME, execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    walletAddress: ME,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <PopManagePage contract={C} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents };
}

test("only the organizer manages an event", async () => {
  const { view } = setup(OTHER);
  await waitFor(() => expect(view.getByText("You are not the organizer of this event.")).toBeTruthy());
});

test("the organizer publishes participants and gets their claim links", async () => {
  const { view, intents } = setup(ME);
  await waitFor(() => expect(view.getByText("Manage Event")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText(/Paste Starknet addresses/), { target: { value: `${ME}\n${OTHER}` } });
  fireEvent.click(view.getByText("Publish 2 participants"));
  await waitFor(() => expect(view.getByText("Participants published")).toBeTruthy());
  expect(intents[0]!.kind).toBe("pop-manage");
  expect(intents[0]!.params).toMatchObject({ owner: ME, collection: C, action: "set_allowlist_root" });
  fireEvent.click(view.getByText("Done"));
  await waitFor(() => expect(view.getByText("Download claim links (CSV)")).toBeTruthy());
});

test("the organizer issues a credential to one wallet", async () => {
  const { view, intents } = setup(ME);
  await waitFor(() => expect(view.getByText("Issue credential")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("0x..."), { target: { value: OTHER } });
  fireEvent.click(view.getByText("Issue credential"));
  await waitFor(() => expect(view.getByText("Credential issued")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "pop-manage", params: { owner: ME, collection: C, action: "issue", recipient: OTHER } });
});
