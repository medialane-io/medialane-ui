import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { hasSufficientBalance, useErc20Balance } from "./use-erc20-balance.js";

test("reads the balance through the client's provider", async () => {
  const calls: unknown[] = [];
  const client = {
    provider: {
      callContract: async (call: unknown) => {
        calls.push(call);
        return ["0x5", "0x1"];
      },
    },
  } as unknown as MedialaneClient;

  const { result } = renderHook(() => useErc20Balance(() => client, "0xtoken", "0xholder"));

  await waitFor(() => expect(result.current.rawBalance).toBe(5n + (1n << 128n)));
  expect(calls).toEqual([{ contractAddress: "0xtoken", entrypoint: "balanceOf", calldata: ["0xholder"] }]);
});

test("hasSufficientBalance is null until the balance is known", () => {
  expect(hasSufficientBalance(null, "1", 18)).toBeNull();
});

test("hasSufficientBalance compares human amounts in token units", () => {
  expect(hasSufficientBalance(10n ** 18n, "1", 18)).toBe(true);
  expect(hasSufficientBalance(10n ** 18n - 1n, "1", 18)).toBe(false);
});

test("hasSufficientBalance is null for an empty or non-positive amount", () => {
  expect(hasSufficientBalance(5n, "", 18)).toBeNull();
  expect(hasSufficientBalance(5n, "0", 18)).toBeNull();
});
