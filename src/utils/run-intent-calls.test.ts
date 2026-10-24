import { test, expect } from "bun:test";
import { runIntentCalls, runIntentsCalls } from "./run-intent-calls.js";

test("runs the created intent's calls with its id", async () => {
  const calls = [{ contractAddress: "0x1", entrypoint: "claim", calldata: ["1", "0"] }];
  const seen: unknown[] = [];
  const signer = { execute: async (c: unknown, opts?: unknown) => { seen.push({ c, opts }); return { txHash: "0xtx" }; } };
  const result = await runIntentCalls(signer, async () => ({ id: "i1", requiresSignature: false as const, calls, expiresAt: "" }));
  expect(result).toEqual({ txHash: "0xtx" });
  expect(seen).toEqual([{ c: calls, opts: { intentIds: ["i1"] } }]);
});

test("runIntentsCalls sends the calls of every intent as one transaction", async () => {
  const sent: { calls: unknown[]; opts: unknown }[] = [];
  const signer = { execute: async (calls: unknown[], opts: unknown) => { sent.push({ calls, opts }); return { txHash: "0x1" }; } };
  const a = { id: "a", requiresSignature: false, calls: [{ n: 1 }] };
  const b = { id: "b", requiresSignature: false, calls: [{ n: 2 }, { n: 3 }] };
  const result = await runIntentsCalls(signer as never, [a, b] as never);
  expect(result.txHash).toBe("0x1");
  expect(sent).toEqual([{ calls: [{ n: 1 }, { n: 2 }, { n: 3 }], opts: { intentIds: ["a", "b"] } }]);
});

test("runIntentsCalls refuses an intent that needs a signature", async () => {
  const signer = { execute: async () => ({ txHash: "0x1" }) };
  await expect(runIntentsCalls(signer as never, [{ id: "a", requiresSignature: true }] as never)).rejects.toThrow("prebuilt");
});
