import { beforeEach, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
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
const BACKGROUND_MS = 25_000;
const realSetTimeout = globalThis.setTimeout;

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

async function backgroundTimersAfterLoad(use: () => unknown): Promise<number[]> {
  const delays: number[] = [];
  globalThis.setTimeout = ((fn: () => void, ms?: number, ...args: unknown[]) => {
    if (typeof ms === "number" && ms >= BACKGROUND_MS) delays.push(ms);
    return realSetTimeout(fn, ms, ...args);
  }) as unknown as typeof setTimeout;
  try {
    renderHook(use, { wrapper: Wrapper });
    await waitFor(() => expect(count).toBeGreaterThanOrEqual(1));
    await act(async () => {
      await new Promise((resolve) => realSetTimeout(resolve, 30));
    });
    return delays;
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
}

beforeEach(() => {
  count = 0;
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
  test(`${name} schedules no background refresh`, async () => {
    expect(await backgroundTimersAfterLoad(use)).toEqual([]);
  });
}

test("useUsdPrices schedules no background refresh beyond sharing one result", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    count++;
    return Response.json({ data: { usd: { STRK: 1 } } });
  }) as unknown as typeof fetch;
  try {
    expect(await backgroundTimersAfterLoad(() => useUsdPrices())).toEqual([60_000]);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("useTokenListings still refreshes every 60 seconds while the token is viewed", async () => {
  expect(await backgroundTimersAfterLoad(() => useTokenListings(ADDRESS, "1"))).toEqual([60_000]);
});

test("useCounterOffers still refreshes every 60 seconds while the order is viewed", async () => {
  expect(await backgroundTimersAfterLoad(() => useCounterOffers({ originalOrderHash: "0x1" }))).toEqual([60_000]);
});
