import { test, expect } from "bun:test";
import type { ApiClient } from "@medialane/sdk";
import { collectSitemapData } from "./sitemap-data.js";

function fakeApi(totals: { collections: number; tokens: number; creators: number }, failTokensAtPage?: number) {
  const calls = { collections: 0, tokens: 0, creators: 0 };
  const page = (total: number, n: number, size: number) =>
    Array.from({ length: Math.max(0, Math.min(size, total - (n - 1) * size)) }, (_, i) => (n - 1) * size + i);
  const api = {
    listCollections: async ({ page: n, limit }: { page: number; limit: number }) => {
      calls.collections++;
      return { data: page(totals.collections, n, limit).map((i) => ({ contractAddress: `0x${i}` })) };
    },
    getTokens: async ({ page: n, limit }: { page: number; limit: number }) => {
      calls.tokens++;
      if (failTokensAtPage === n) throw new Error("down");
      return { data: page(totals.tokens, n, limit).map((i) => ({ contractAddress: "0x1", tokenId: String(i) })) };
    },
    getCreators: async ({ page: n, limit }: { page: number; limit: number }) => {
      calls.creators++;
      return { creators: page(totals.creators, n, limit).map((i) => ({ username: i % 2 ? `u${i}` : null })) };
    },
  } as unknown as ApiClient;
  return { api, calls };
}

test("every page is read, past the backend's per-page cap", async () => {
  const { api } = fakeApi({ collections: 250, tokens: 130, creators: 120 });
  const data = await collectSitemapData(api);
  expect(data.collections).toHaveLength(250);
  expect(data.tokens).toHaveLength(130);
  expect(data.creatorUsernames).toHaveLength(60);
});

test("reading stops at a short page", async () => {
  const { api, calls } = fakeApi({ collections: 250, tokens: 96, creators: 0 });
  await collectSitemapData(api);
  expect(calls.collections).toBe(3);
  expect(calls.tokens).toBe(3);
  expect(calls.creators).toBe(1);
});

test("the sitemap never grows past its limits", async () => {
  const { api } = fakeApi({ collections: 5000, tokens: 5000, creators: 5000 });
  const data = await collectSitemapData(api, { collections: 150, tokens: 100, creators: 60 });
  expect(data.collections).toHaveLength(150);
  expect(data.tokens).toHaveLength(100);
});

test("a failing page keeps what was already read", async () => {
  const { api } = fakeApi({ collections: 10, tokens: 200, creators: 10 }, 2);
  const data = await collectSitemapData(api);
  expect(data.tokens).toHaveLength(48);
});
