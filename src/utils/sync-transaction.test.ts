import { test, expect, mock } from "bun:test";
import { syncTransaction } from "./sync-transaction.js";

test("a synced transaction reports what it applied", async () => {
  global.fetch = mock(async () => ({
    ok: true,
    json: async () => ({ data: { applied: 2, contracts: ["0xc"], pending: false } }),
  } as Response)) as unknown as typeof fetch;

  expect(await syncTransaction("0xtx")).toEqual({ applied: 2, contracts: ["0xc"], pending: false });
});

test("a transaction still in the mempool reports itself pending", async () => {
  global.fetch = mock(async () => ({
    ok: true,
    json: async () => ({ data: { applied: 0, pending: true } }),
  } as Response)) as unknown as typeof fetch;

  expect((await syncTransaction("0xtx"))?.pending).toBe(true);
});

test("a refused sync answers nothing rather than throwing", async () => {
  global.fetch = mock(async () => ({ ok: false, json: async () => ({}) } as Response)) as unknown as typeof fetch;
  expect(await syncTransaction("0xtx")).toBe(null);
});

test("a sync that never answers gives up rather than blocking the flow", async () => {
  global.fetch = mock(() => new Promise(() => {})) as unknown as typeof fetch;
  expect(await syncTransaction("0xtx", 10)).toBe(null);
});
