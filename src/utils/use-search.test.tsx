import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useSearch } from "./use-search.js";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";

const withClient = (client: MedialaneClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MedialaneAppProvider value={{ getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp}>{children}</MedialaneAppProvider>;
  };

const clientWith = (calls: unknown[][]) =>
  ({
    api: {
      search: async (...args: unknown[]) => {
        calls.push(args);
        return { data: { tokens: [], collections: [], creators: [{ walletAddress: "0xw", username: String(args[0]), name: null, bio: null, avatarImage: null }] }, query: args[0] };
      },
    },
  }) as unknown as MedialaneClient;

test("useSearch reads nothing below the minimum length", async () => {
  const calls: unknown[][] = [];
  const { result } = renderHook(() => useSearch(" a "), { wrapper: withClient(clientWith(calls)) });
  await new Promise((r) => setTimeout(r, 20));
  expect(result.current.results).toBeNull();
  expect(result.current.isLoading).toBe(false);
  expect(calls).toEqual([]);
});

test("useSearch reads the trimmed query with the limit", async () => {
  const calls: unknown[][] = [];
  const { result } = renderHook(() => useSearch("  drums ", { limit: 4 }), { wrapper: withClient(clientWith(calls)) });
  await waitFor(() => expect(result.current.results?.creators[0]?.username).toBe("drums"));
  expect(calls).toEqual([["drums", 4]]);
});

test("useSearch drops results when the query is cleared", async () => {
  const calls: unknown[][] = [];
  const { result, rerender } = renderHook(({ q }) => useSearch(q, { keepPrevious: true }), {
    wrapper: withClient(clientWith(calls)),
    initialProps: { q: "piano" },
  });
  await waitFor(() => expect(result.current.results).not.toBeNull());
  rerender({ q: "" });
  expect(result.current.results).toBeNull();
});
