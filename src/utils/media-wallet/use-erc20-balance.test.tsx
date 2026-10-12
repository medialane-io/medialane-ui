import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { ProviderInterface } from "starknet";
import { useErc20Balance } from "./use-erc20-balance.js";

test("reads the balance through the provider the app passes in", async () => {
  const calls: unknown[] = [];
  const provider = {
    callContract: async (call: unknown) => {
      calls.push(call);
      return ["0x5", "0x1"];
    },
  } as unknown as ProviderInterface;

  const { result } = renderHook(() => useErc20Balance(provider, "0xtoken", "0xholder"));

  await waitFor(() => expect(result.current.rawBalance).toBe(5n + (1n << 128n)));
  expect(calls).toEqual([{ contractAddress: "0xtoken", entrypoint: "balanceOf", calldata: ["0xholder"] }]);
});
