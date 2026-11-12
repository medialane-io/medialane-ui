import { beforeEach, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { useRemixOffers } from "./use-my-remix-offers.js";

const realSetTimeout = globalThis.setTimeout;
const queries: unknown[] = [];

const client = {
  api: { remix: { list: async (query: unknown) => { queries.push(query); return { data: [{ id: "o1" }], meta: { total: 1 } }; } } },
} as unknown as MedialaneClient;

const wrapperFor = (app: { walletAddress: string | null; signedIn: boolean }) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <MedialaneAppProvider value={{ getClient: () => client, ...app } as unknown as MedialaneApp}>{children}</MedialaneAppProvider>
      </SWRConfig>
    );
  };

const settle = () => act(async () => { await new Promise((resolve) => realSetTimeout(resolve, 30)); });

beforeEach(() => {
  queries.length = 0;
});

test("nothing is requested without a wallet or while signed out", async () => {
  renderHook(() => useRemixOffers("creator"), { wrapper: wrapperFor({ walletAddress: null, signedIn: true }) });
  renderHook(() => useRemixOffers("creator"), { wrapper: wrapperFor({ walletAddress: "0x1", signedIn: false }) });
  await settle();
  expect(queries).toEqual([]);
});

test("a signed-in wallet lists its offers by role and status", async () => {
  const { result } = renderHook(() => useRemixOffers("requester", "PENDING"), { wrapper: wrapperFor({ walletAddress: "0x1", signedIn: true }) });
  await waitFor(() => expect(result.current.offers).toHaveLength(1));
  expect(result.current.total).toBe(1);
  expect(queries).toEqual([{ role: "requester", status: "PENDING" }]);
});

test("a different wallet gets its own offers, not the previous wallet's", async () => {
  const cache = new Map();
  let wallet = "0x1";
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => cache }}>
      <MedialaneAppProvider value={{ getClient: () => client, walletAddress: wallet, signedIn: true } as unknown as MedialaneApp}>{children}</MedialaneAppProvider>
    </SWRConfig>
  );
  const { result, rerender } = renderHook(() => useRemixOffers("creator"), { wrapper });
  await waitFor(() => expect(result.current.offers).toHaveLength(1));
  wallet = "0x2";
  rerender();
  await waitFor(() => expect(queries).toHaveLength(2));
});

test("offers refresh every 30 seconds while mounted", async () => {
  const delays: number[] = [];
  globalThis.setTimeout = ((fn: () => void, ms?: number, ...args: unknown[]) => {
    if (typeof ms === "number" && ms >= 25_000) delays.push(ms);
    return realSetTimeout(fn, ms, ...args);
  }) as unknown as typeof setTimeout;
  try {
    const { result } = renderHook(() => useRemixOffers("creator"), { wrapper: wrapperFor({ walletAddress: "0x1", signedIn: true }) });
    await waitFor(() => expect(result.current.offers).toHaveLength(1));
    await settle();
    expect(delays).toEqual([30_000]);
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
});
