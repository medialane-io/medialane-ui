import { expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useOwnedTokens, useTokenBalance, useTokensByOwner } from "./use-tokens.js";
import { queryKeys } from "./query-keys.js";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";

const withClient = (client: MedialaneClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MedialaneAppProvider value={{ getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp}>{children}</MedialaneAppProvider>;
  };

const clientWith = (calls: unknown[][]) =>
  ({
    api: { tokens: { balance: async (...args: unknown[]) => {
        calls.push(args);
        return { owner: args[2], amount: "4" };
      } } },
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
    api: { tokens: { ownedBy: async (_a: string, opts: { page?: number }) => { pages.push(opts.page); return { data: [] }; } } },
  } as unknown as MedialaneClient;
  const { rerender } = renderHook(({ page }) => useTokensByOwner("0xowner-pages", page, 20), { wrapper: withClient(client), initialProps: { page: 1 } });
  await waitFor(() => expect(pages).toEqual([1]));
  rerender({ page: 2 });
  await waitFor(() => expect(pages).toEqual([1, 2]));
});

test("useOwnedTokens accumulates pages and reports whether more remain", async () => {
  const pages: number[] = [];
  const client = {
    api: { tokens: { ownedBy: async (_a: string, opts: { page: number; limit: number }) => {
      pages.push(opts.page);
      return { data: [{ tokenId: `p${opts.page}a` }, { tokenId: `p${opts.page}b` }], meta: { total: 4 } };
    } } },
  } as unknown as MedialaneClient;
  const { result } = renderHook(() => useOwnedTokens("0xowner-infinite", 2), { wrapper: withClient(client) });
  await waitFor(() => expect(result.current.tokens.length).toBe(2));
  expect(result.current.total).toBe(4);
  expect(result.current.hasMore).toBe(true);
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.tokens.map((t) => t.tokenId)).toEqual(["p1a", "p1b", "p2a", "p2b"]));
  expect(result.current.hasMore).toBe(false);
  expect(pages).toEqual([1, 2]);
});

test("useOwnedTokens reloads when asked to", async () => {
  let calls = 0;
  const client = { api: { tokens: { ownedBy: async () => { calls += 1; return { data: [], meta: { total: 0 } }; } } } } as unknown as MedialaneClient;
  const { result } = renderHook(() => useOwnedTokens("0xowner-reload", 2), { wrapper: withClient(client) });
  await waitFor(() => expect(calls).toBe(1));
  await act(async () => { await result.current.mutate(); });
  expect(calls).toBe(2);
});
