import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useTokenBalance, useTokensByOwner } from "./use-tokens.js";
import { queryKeys } from "./query-keys.js";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";

const withClient = (client: MedialaneClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MedialaneAppProvider value={{ getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp}>{children}</MedialaneAppProvider>;
  };

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
  const { result } = renderHook(() => useTokenBalance("0xc1", "7", "0xw1"), { wrapper: withClient(client) });
  await waitFor(() => expect(result.current.amount).toBe("4"));
  expect(calls).toEqual([["0xc1", "7", "0xw1"]]);
});

test("useTokenBalance without an owner reads nothing", async () => {
  const calls: unknown[][] = [];
  const client = clientWith(calls);
  const { result } = renderHook(() => useTokenBalance("0xc2", "7", null), { wrapper: withClient(client) });
  await new Promise((r) => setTimeout(r, 20));
  expect(result.current.amount).toBeNull();
  expect(calls).toEqual([]);
});

test("queryKeys.tokenBalance is revalidated with token keys", () => {
  expect(queryKeys.tokenBalance("0xc", "1", "0xw")).toBe("token-balance-0xc-1-0xw");
});

test("useTokensByOwner refetches when the page changes", async () => {
  const pages: unknown[] = [];
  const client = {
    api: { getTokensByOwner: async (_a: string, page: number) => { pages.push(page); return { data: [] }; } },
  } as unknown as MedialaneClient;
  const { rerender } = renderHook(({ page }) => useTokensByOwner("0xowner-pages", page, 20), { wrapper: withClient(client), initialProps: { page: 1 } });
  await waitFor(() => expect(pages).toEqual([1]));
  rerender({ page: 2 });
  await waitFor(() => expect(pages).toEqual([1, 2]));
});
