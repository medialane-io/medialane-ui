import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useTokenBalance } from "./use-tokens.js";
import { queryKeys } from "./query-keys.js";

const clientWith = (calls: unknown[][]) =>
  ({
    api: {
      getTokenBalance: async (...args: unknown[]) => {
        calls.push(args);
        return { data: { owner: args[2], amount: "4" } };
      },
    },
  }) as unknown as MedialaneClient;

test("useTokenBalance reads the owner's balance", async () => {
  const calls: unknown[][] = [];
  const client = clientWith(calls);
  const { result } = renderHook(() => useTokenBalance(() => client, "0xc1", "7", "0xw1"));
  await waitFor(() => expect(result.current.amount).toBe("4"));
  expect(calls).toEqual([["0xc1", "7", "0xw1"]]);
});

test("useTokenBalance without an owner reads nothing", async () => {
  const calls: unknown[][] = [];
  const client = clientWith(calls);
  const { result } = renderHook(() => useTokenBalance(() => client, "0xc2", "7", null));
  await new Promise((r) => setTimeout(r, 20));
  expect(result.current.amount).toBeNull();
  expect(calls).toEqual([]);
});

test("queryKeys.tokenBalance is revalidated with token keys", () => {
  expect(queryKeys.tokenBalance("0xc", "1", "0xw")).toBe("token-balance-0xc-1-0xw");
});
