import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, useMedialaneApp, type MedialaneApp } from "./app.js";
import { runIntentCalls } from "./run-intent-calls.js";

const app: MedialaneApp = {
  getClient: () => ({}) as MedialaneClient,
  getSigner: () => ({ address: "0xa", execute: async () => ({ txHash: "0x1" }), signTypedData: async () => [] }),
  walletAddress: "0xa",
  onRequireWallet: () => {},
};

test("useMedialaneApp returns the provided app", () => {
  const wrapper = ({ children }: { children: ReactNode }) => <MedialaneAppProvider value={app}>{children}</MedialaneAppProvider>;
  const { result } = renderHook(() => useMedialaneApp(), { wrapper });
  expect(result.current).toBe(app);
});

test("useMedialaneApp outside a provider throws", () => {
  expect(() => renderHook(() => useMedialaneApp())).toThrow("MedialaneAppProvider missing");
});

test("runIntentCalls executes the intent's calls with its id", async () => {
  const seen: unknown[] = [];
  const signer = { execute: async (calls: unknown[], opts?: { intentIds?: string[] }) => { seen.push(calls, opts); return { txHash: "0xt" }; } };
  const calls = [{ contractAddress: "0xc", entrypoint: "claim", calldata: [] }];
  const result = await runIntentCalls(signer, async () => ({ data: { id: "i1", calls } as never }));
  expect(result.txHash).toBe("0xt");
  expect(seen).toEqual([calls, { intentIds: ["i1"] }]);
});
