import { describe, expect, test } from "bun:test";
import { readDropState } from "./use-drops.js";

const DROP = { organizer: "0x1", startTime: 0, endTime: 0, price: 5n, paymentToken: "0x2", maxPerWallet: 1n, allowlistRoot: "0x0", maxSupply: 10n, totalMinted: 0n };

function deps(drop: typeof DROP | null) {
  const chainCalls: string[] = [];
  const client = { api: { getDropState: async () => drop } } as never;
  const provider = {
    callContract: async ({ entrypoint }: { entrypoint: string }) => {
      chainCalls.push(entrypoint);
      return ["0x3", "0x0"];
    },
  } as never;
  return { client, provider, chainCalls };
}

describe("drop state", () => {
  test("a visitor reads the drop's terms from the backend and nothing from chain", async () => {
    const { client, provider, chainCalls } = deps(DROP);
    expect(await readDropState(client, provider, "0xd", null)).toEqual({ drop: DROP, claimed: null, balance: null });
    expect(chainCalls).toEqual([]);
  });

  test("a wallet also reads its own claims and balance", async () => {
    const { client, provider, chainCalls } = deps(DROP);
    const state = await readDropState(client, provider, "0xd", "0x9");
    expect(state.claimed).toBe(3n);
    expect(state.balance).toBe(3n);
    expect(chainCalls.sort()).toEqual(["balance_of", "claimed_by"]);
  });

  test("a drop the backend cannot read is an error", async () => {
    const { client, provider } = deps(null);
    await expect(readDropState(client, provider, "0xd", null)).rejects.toThrow();
  });
});
