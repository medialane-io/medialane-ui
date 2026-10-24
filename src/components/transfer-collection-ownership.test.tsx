import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));

const { TransferCollectionOwnership } = await import("./transfer-collection-ownership.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const NEXT = "0x00000000000000000000000000000000000000000000000000000000000000bb";

function setup(onTransferred?: () => void) {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
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
    <MedialaneAppProvider value={app}>
      <TransferCollectionOwnership collectionId="12" currentOwner={ME} collectionName="Songs" onTransferred={onTransferred} />
    </MedialaneAppProvider>,
  );
  return { view, intents };
}

test("the current owner address cannot be the new owner", () => {
  const { view } = setup();
  fireEvent.click(view.getByText("Transfer ownership"));
  fireEvent.change(view.getByPlaceholderText("0x…"), { target: { value: ME } });
  expect(view.getByText("This is already the current owner.")).toBeTruthy();
  expect((view.getByText("Continue") as HTMLButtonElement).disabled).toBe(true);
});

test("the transfer is confirmed before anything is sent", async () => {
  let done = 0;
  const { view, intents } = setup(() => { done++; });
  fireEvent.click(view.getByText("Transfer ownership"));
  fireEvent.change(view.getByPlaceholderText("0x…"), { target: { value: NEXT } });
  fireEvent.click(view.getByText("Continue"));
  expect(intents).toEqual([]);
  const buttons = view.getAllByText("Transfer ownership");
  fireEvent.click(buttons[buttons.length - 1]!);
  await waitFor(() => expect(view.getByText("Ownership transferred")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "transfer-collection-ownership", params: { owner: ME, collectionId: "12", newOwner: NEXT } });
  expect(done).toBe(1);
});
