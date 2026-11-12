import { afterEach, beforeEach, expect, jest, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { useActivities, useActivitiesByAddress } from "./use-activities.js";
import { useCollectionsByOwner } from "./use-collections.js";
import { usePriceMap } from "./use-coin-price.js";
import { useComments } from "./use-comments.js";
import { useCollectionFloorListings, useCounterOffers, useOrders, useReceivedOffers, useTokenListings, useUserOrders } from "./use-orders.js";
import { useTokenRemixes } from "./use-remix-offers.js";
import { useTokensByIpType } from "./use-tokens-by-ip-type.js";
import { useTokensByOwner } from "./use-tokens.js";
import { useUsdPrices } from "./use-usd-prices.js";

const ADDRESS = "0x" + "a".repeat(64);

let count = 0;
const hit = async () => {
  count++;
  return { data: [], meta: { total: 0 } };
};

const client = {
  api: {
    orders: { list: hit, forToken: hit, byUser: hit, receivedBy: hit, counterOffers: hit },
    activity: { list: hit, byAddress: hit },
    collections: { list: hit },
    tokens: { comments: hit, remixes: hit, list: hit, ownedBy: hit },
    coins: { prices: async () => { count++; return {}; } },
  },
} as unknown as MedialaneClient;

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={{ getClient: () => client } as unknown as MedialaneApp}>{children}</MedialaneAppProvider>
    </SWRConfig>
  );
}

async function callsAfterFiveMinutes(use: () => unknown): Promise<number> {
  jest.useFakeTimers();
  renderHook(use, { wrapper: Wrapper });
  for (let i = 0; i < 5; i++) await act(async () => { await Promise.resolve(); });
  for (let i = 0; i < 10; i++) {
    await act(async () => {
      jest.advanceTimersByTime(30_000);
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  return count;
}

beforeEach(() => {
  count = 0;
});

afterEach(() => {
  jest.useRealTimers();
});

const loadsOnce: Array<[string, () => unknown]> = [
  ["useOrders", () => useOrders({})],
  ["useUserOrders", () => useUserOrders(ADDRESS)],
  ["useReceivedOffers", () => useReceivedOffers(ADDRESS)],
  ["useCollectionFloorListings", () => useCollectionFloorListings(ADDRESS)],
  ["useActivities", () => useActivities({})],
  ["useActivitiesByAddress", () => useActivitiesByAddress(ADDRESS)],
  ["useCollectionsByOwner", () => useCollectionsByOwner(ADDRESS)],
  ["useComments", () => useComments(ADDRESS, "1")],
  ["useTokenRemixes", () => useTokenRemixes(ADDRESS, "1")],
  ["useTokensByIpType", () => useTokensByIpType("audio")],
  ["useTokensByOwner", () => useTokensByOwner(ADDRESS)],
  ["usePriceMap", () => usePriceMap()],
];

for (const [name, use] of loadsOnce) {
  test(`${name} fetches once and does not poll`, async () => {
    expect(await callsAfterFiveMinutes(use)).toBe(1);
  });
}

test("useUsdPrices fetches once and does not poll", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    count++;
    return Response.json({ data: { usd: { STRK: 1 } } });
  }) as unknown as typeof fetch;
  try {
    expect(await callsAfterFiveMinutes(() => useUsdPrices())).toBe(1);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("useTokenListings still refreshes while the token is viewed", async () => {
  expect(await callsAfterFiveMinutes(() => useTokenListings(ADDRESS, "1"))).toBeGreaterThan(1);
});

test("useCounterOffers still refreshes while the order is viewed", async () => {
  expect(await callsAfterFiveMinutes(() => useCounterOffers({ originalOrderHash: "0x1" }))).toBeGreaterThan(1);
});
