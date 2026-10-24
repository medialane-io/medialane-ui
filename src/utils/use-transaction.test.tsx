import { expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import type { FastMintSigner } from "../components/fast-mint/types.js";
import { useTransaction } from "./use-transaction.js";

const HASH = "0xabc";

function setup(executionStatus = "SUCCEEDED") {
  let released = 0;
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: executionStatus, events: [{ from_address: "0x1", keys: ["0x2"] }] }) },
    api: { intents: { syncTransaction: async () => ({ pending: false }) } },
  } as unknown as MedialaneClient;
  const signer: FastMintSigner = {
    address: "0xa",
    execute: async () => ({ txHash: HASH }),
    signTypedData: async () => [],
  };
  const app = {
    getClient: () => client,
    getSigner: () => signer,
    walletAddress: "0xa",
    onRequireWallet: () => {},
    releaseSigner: () => { released += 1; },
  } as MedialaneApp;
  const view = renderHook(() => useTransaction(), {
    wrapper: ({ children }: { children: React.ReactNode }) => <MedialaneAppProvider value={app}>{children}</MedialaneAppProvider>,
  });
  return { view, released: () => released };
}

test("moves through preparing, submitting, confirming and success", async () => {
  const { view } = setup();
  const seen: string[] = [];
  const watch = () => seen.push(view.result.current.phase);
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let running!: Promise<boolean>;
  act(() => {
    running = view.result.current.run(async (signer) => {
      watch();
      await signer.execute([]);
      watch();
      await gate;
    });
  });
  await waitFor(() => expect(view.result.current.phase).toBe("confirming"));
  seen.push(view.result.current.phase);
  release();
  await act(async () => { await running; });
  expect(view.result.current.phase).toBe("success");
  expect(seen[0]).toBe("preparing");
  expect(seen).toContain("confirming");
});

test("enters submitting only when the signer executes", async () => {
  const { view } = setup();
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let running!: Promise<boolean>;
  act(() => {
    running = view.result.current.run(async () => { await gate; });
  });
  await waitFor(() => expect(view.result.current.phase).toBe("preparing"));
  release();
  await act(async () => { await running; });
  expect(view.result.current.phase).toBe("success");
  expect(view.result.current.txHash).toBeNull();
});

test("keeps the hash and receipt on success", async () => {
  const { view } = setup();
  await act(async () => { await view.result.current.run(async (signer) => { await signer.execute([]); }); });
  expect(view.result.current.phase).toBe("success");
  expect(view.result.current.txHash).toBe(HASH);
  expect(view.result.current.receipt?.events?.length).toBe(1);
});

test("ends in error with the revert message and does not succeed", async () => {
  const { view } = setup("REVERTED");
  await act(async () => { await view.result.current.run(async (signer) => { await signer.execute([]); }); });
  expect(view.result.current.phase).toBe("error");
  expect(view.result.current.error).toContain("reverted");
});

test("releases the signer after success and after error", async () => {
  const ok = setup();
  await act(async () => { await ok.view.result.current.run(async (signer) => { await signer.execute([]); }); });
  expect(ok.released()).toBe(1);
  const bad = setup();
  await act(async () => { await bad.view.result.current.run(async () => { throw new Error("nope"); }); });
  expect(bad.view.result.current.phase).toBe("error");
  expect(bad.released()).toBe(1);
});

test("reset returns to idle and clears hash, receipt and error", async () => {
  const { view } = setup();
  await act(async () => { await view.result.current.run(async (signer) => { await signer.execute([]); }); });
  act(() => view.result.current.reset());
  expect(view.result.current.phase).toBe("idle");
  expect(view.result.current.txHash).toBeNull();
  expect(view.result.current.receipt).toBeNull();
  expect(view.result.current.error).toBeNull();
});

test("run resolves true on success and false on failure", async () => {
  const ok = setup();
  let okResult = false;
  await act(async () => { okResult = await ok.view.result.current.run(async (signer) => { await signer.execute([]); }); });
  expect(okResult).toBe(true);
  const bad = setup("REVERTED");
  let badResult = true;
  await act(async () => { badResult = await bad.view.result.current.run(async (signer) => { await signer.execute([]); }); });
  expect(badResult).toBe(false);
});
