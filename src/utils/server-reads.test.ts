import { expect, test } from "bun:test";
import { createServerReads, type ServerReadCache } from "./server-reads.js";

function memoryCache() {
  const stored = new Map<string, unknown>();
  const used: number[] = [];
  const cache: ServerReadCache = (read, key, { revalidate }) =>
    (async (...args: never[]) => {
      used.push(revalidate);
      const id = JSON.stringify([key, args]);
      if (stored.has(id)) return stored.get(id);
      const value = await read(...args);
      stored.set(id, value);
      return value;
    }) as typeof read;
  return { cache, stored, used };
}

const apiError = (status: number) => Object.assign(new Error(`status ${status}`), { status });

function setup(get: (contract: string, tokenId: string) => Promise<unknown>) {
  const calls: string[] = [];
  const memory = memoryCache();
  const api = {
    tokens: { get: (contract: string, tokenId: string) => { calls.push(`${contract}/${tokenId}`); return get(contract, tokenId); } },
    collections: { list: async () => ({ data: [] }) },
    orders: { list: async () => ({ data: [] }) },
  };
  const reads = createServerReads({
    api: () => api as never,
    cache: memory.cache,
    backendUrl: "https://backend.test",
    absoluteUrl: (path) => `https://app.test${path}`,
  });
  return { reads, calls, ...memory };
}

test("a found item is cached for the detail window", async () => {
  const { reads, calls, used } = setup(async () => ({ name: "Real" }));
  expect(await reads.fetchTokenMeta("0x1", "1")).toEqual({ name: "Real" } as never);
  expect(await reads.fetchTokenMeta("0x1", "1")).toEqual({ name: "Real" } as never);
  expect(calls).toEqual(["0x1/1"]);
  expect(used).toEqual([300, 300]);
});

for (const status of [404, 400]) {
  test(`an item the API answers ${status} for is cached as absent`, async () => {
    const { reads, calls, used } = setup(async () => { throw apiError(status); });
    expect(await reads.fetchTokenMeta("0x1", "1")).toBeNull();
    expect(await reads.fetchTokenMeta("0x1", "1")).toBeNull();
    expect(calls).toHaveLength(1);
    expect(used).toEqual([300, 300]);
  });
}

test("an address that is not valid is absent and never sent to the API", async () => {
  const { reads, calls } = setup(async () => ({ name: "Real" }));
  expect(await reads.fetchTokenMeta("not-an-address", "1")).toBeNull();
  expect(calls).toEqual([]);
});

for (const [label, error] of [["a server error", apiError(500)], ["a rate limit", apiError(429)], ["a network failure", new TypeError("fetch failed")]] as const) {
  test(`${label} is not saved, and shortens how long the page is kept`, async () => {
    let failing = true;
    const { reads, calls, used } = setup(async () => { if (failing) throw error; return { name: "Real" }; });
    expect(await reads.fetchTokenMeta("0x1", "1")).toBeNull();
    expect(used).toContain(1);
    failing = false;
    expect(await reads.fetchTokenMeta("0x1", "1")).toEqual({ name: "Real" } as never);
    expect(calls).toHaveLength(2);
  });
}

test("lists are cached for the shorter list window", async () => {
  const { reads, used } = setup(async () => null);
  await reads.fetchFeaturedCollections(3);
  await reads.fetchActiveOrders(50);
  expect(used).toEqual([60, 60]);
});

test("images served by the backend go through the app, others stay as they are", () => {
  const { reads } = setup(async () => null);
  expect(reads.ipfsToHttpServer("https://backend.test/media/a/image")).toBe(`https://app.test/api/img?url=${encodeURIComponent("https://backend.test/media/a/image")}`);
  expect(reads.ipfsToHttpServer("https://elsewhere.test/a.png")).toBe("https://elsewhere.test/a.png");
});
