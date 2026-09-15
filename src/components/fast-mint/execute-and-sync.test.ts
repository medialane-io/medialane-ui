import { test, expect, mock } from "bun:test";
import { executeAndSync } from "./execute-and-sync.js";

test("the transaction is synced before the mint reports success", async () => {
  const order: string[] = [];
  const result = await executeAndSync(
    async () => {
      order.push("execute");
      return { txHash: "0xtx" };
    },
    async (txHash) => {
      order.push(`sync ${txHash}`);
    },
  );
  order.push("success");

  expect(result).toEqual({ txHash: "0xtx" });
  expect(order).toEqual(["execute", "sync 0xtx", "success"]);
});

test("a sync that gives up still returns the transaction", async () => {
  const result = await executeAndSync(async () => ({ txHash: "0xtx" }), async () => null);
  expect(result).toEqual({ txHash: "0xtx" });
});

test("a failed transaction is never synced", async () => {
  const sync = mock(async () => null);
  await expect(
    executeAndSync(async () => {
      throw new Error("reverted onchain");
    }, sync),
  ).rejects.toThrow("reverted onchain");
  expect(sync).not.toHaveBeenCalled();
});
