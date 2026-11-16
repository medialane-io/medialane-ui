import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getCoordinates } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { ArchiveAssetDialog } = await import("./archive-asset-dialog.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const REGISTRY = getCoordinates("STARKNET").collection721;

function show(opts: { registry?: string; archived?: string; hasActiveListing?: boolean; wallet?: string | null; failExecute?: boolean } = {}) {
  const executed: Array<{ contractAddress: string; entrypoint: string; calldata: string[] }[]> = [];
  const log = { closes: 0, successes: 0 };
  const answers: Record<string, string[]> = {
    get_registry: [opts.registry ?? REGISTRY],
    get_collection_id: ["9", "0"],
    is_archived: [opts.archived ?? "0"],
  };
  const client = {
    provider: {
      callContract: async ({ entrypoint }: { entrypoint: string }) => answers[entrypoint],
      getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }),
    },
    api: { intents: { syncTransaction: async () => ({ pending: false }) } },
  } as unknown as MedialaneClient;
  const signer = {
    address: ME,
    execute: async (calls: never) => {
      if (opts.failExecute) throw new Error("User rejected request");
      executed.push(calls);
      return { txHash: "0x1" };
    },
    signTypedData: async () => [],
  };
  const app = { getClient: () => client, getSigner: () => signer, walletAddress: opts.wallet === undefined ? ME : opts.wallet, onRequireWallet: () => {} };
  render(
    <MedialaneAppProvider value={app as never}>
      <ArchiveAssetDialog
        open
        onOpenChange={(value) => { if (!value) log.closes++; }}
        contractAddress="0x123"
        tokenId="42"
        tokenName="Sunrise"
        hasActiveListing={opts.hasActiveListing}
        onSuccess={() => { log.successes++; }}
      />
    </MedialaneAppProvider>,
  );
  return { executed, log };
}

describe("ArchiveAssetDialog", () => {
  test("warns that archiving is permanent and sends nothing until confirmed", async () => {
    const { executed } = show();
    await screen.findByText(/Archiving is permanent and cannot be undone/);
    await screen.findByText("Archive this asset permanently?");
    expect(executed).toEqual([]);
  });

  test("confirming sends one archive call to the registry with the collection and token ids", async () => {
    const { executed } = show();
    await screen.findByText("Archive this asset permanently?");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Archive permanently" })); });
    await waitFor(() => expect(executed).toHaveLength(1));
    expect(executed[0]).toEqual([{ contractAddress: REGISTRY, entrypoint: "archive", calldata: ["9", "0", "42", "0"] }]);
    await screen.findByText("Asset archived");
  });

  test("Done after success closes the dialog and refreshes the page", async () => {
    const { log } = show();
    await screen.findByText("Archive this asset permanently?");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Archive permanently" })); });
    await act(async () => { fireEvent.click(await screen.findByRole("button", { name: "Done" })); });
    expect(log.successes).toBe(1);
    expect(log.closes).toBe(1);
  });

  test("an asset that is already archived cannot be archived again", async () => {
    show({ archived: "1" });
    await screen.findByText("This asset is already archived.");
    expect((screen.getByRole("button", { name: "Archive permanently" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("an asset outside the registry cannot be archived", async () => {
    show({ registry: "0xdead" });
    await screen.findByText("This asset can't be archived.");
    expect((screen.getByRole("button", { name: "Archive permanently" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("an active listing is flagged", async () => {
    show({ hasActiveListing: true });
    await screen.findByText(/active listing/);
  });

  test("without a wallet nothing can be sent", async () => {
    show({ wallet: null });
    await screen.findByText("Archive this asset permanently?");
    expect((screen.getByRole("button", { name: "Archive permanently" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("a declined signature shows why, sends nothing and allows another try", async () => {
    const { executed } = show({ failExecute: true });
    await screen.findByText("Archive this asset permanently?");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Archive permanently" })); });
    await screen.findByText(/Nothing was submitted/);
    expect((screen.getByRole("button", { name: "Archive permanently" }) as HTMLButtonElement).disabled).toBe(false);
    expect(executed).toEqual([]);
  });
});
