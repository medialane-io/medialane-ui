import { expect, test } from "bun:test";
import type { ApiClient } from "@medialane/sdk";
import { sitemapChunks, sitemapEntries, sitemapIndexXml } from "./sitemap-data.js";

function fakeApi(totals: { collections: number; tokens: number; creators: number }, failTokensAtPage?: number) {
  const calls = { collections: 0, tokens: 0, creators: 0 };
  const sorts: (string | undefined)[] = [];
  const rows = (total: number, n: number, size: number) =>
    Array.from({ length: Math.max(0, Math.min(size, total - (n - 1) * size)) }, (_, i) => (n - 1) * size + i);
  const api = {
    collections: { list: async ({ page: n = 1, limit = 24 }: { page?: number; limit?: number }) => {
      calls.collections++;
      return { data: rows(totals.collections, n, limit).map((i) => ({ contractAddress: `0x${i}` })), meta: { total: totals.collections } };
    } },
    tokens: { list: async ({ page: n = 1, limit = 24, sort }: { page?: number; limit?: number; sort?: string }) => {
      calls.tokens++;
      sorts.push(sort);
      if (failTokensAtPage === n) throw new Error("down");
      return { data: rows(totals.tokens, n, limit).map((i) => ({ contractAddress: "0x1", tokenId: String(i) })), meta: { total: totals.tokens } };
    } },
    creators: { list: async ({ page: n = 1, limit = 24 }: { page?: number; limit?: number }) => {
      calls.creators++;
      return { creators: rows(totals.creators, n, limit).map((i) => ({ username: i % 2 ? `u${i}` : null })), total: totals.creators };
    } },
  } as unknown as ApiClient;
  return { api, calls, sorts };
}

test("every row falls in exactly one chunk, with no cap", async () => {
  const { api } = fakeApi({ collections: 4001, tokens: 3841, creators: 10 });
  const chunks = await sitemapChunks(api);
  expect(chunks.filter((c) => c.kind === "tokens").map((c) => c.index)).toEqual([0, 1, 2]);
  expect(chunks.filter((c) => c.kind === "collections").map((c) => c.index)).toEqual([0, 1, 2]);
  expect(chunks.filter((c) => c.kind === "creators").map((c) => c.index)).toEqual([0]);
});

test("an empty platform has no chunks", async () => {
  const { api } = fakeApi({ collections: 0, tokens: 0, creators: 0 });
  expect(await sitemapChunks(api)).toEqual([]);
});

test("asset chunks are read oldest first and each holds its own slice", async () => {
  const { api, sorts } = fakeApi({ collections: 0, tokens: 3841, creators: 0 });
  const first = await sitemapEntries(api, { kind: "tokens", index: 0 }, "https://x.test");
  const last = await sitemapEntries(api, { kind: "tokens", index: 2 }, "https://x.test");
  expect(first).toHaveLength(1920);
  expect(last).toHaveLength(1);
  expect(first[0]!.url).toBe("https://x.test/asset/starknet/0x1/0");
  expect(last[0]!.url).toBe("https://x.test/asset/starknet/0x1/3840");
  expect(new Set(sorts)).toEqual(new Set(["oldest"]));
});

test("creators without a username are left out", async () => {
  const { api } = fakeApi({ collections: 0, tokens: 0, creators: 10 });
  const entries = await sitemapEntries(api, { kind: "creators", index: 0 }, "https://x.test");
  expect(entries.map((e) => e.url)).toEqual(["https://x.test/creator/u1", "https://x.test/creator/u3", "https://x.test/creator/u5", "https://x.test/creator/u7", "https://x.test/creator/u9"]);
});

test("a failing page fails the chunk instead of publishing a partial list", async () => {
  const { api } = fakeApi({ collections: 0, tokens: 200, creators: 0 }, 2);
  await expect(sitemapEntries(api, { kind: "tokens", index: 0 }, "https://x.test")).rejects.toThrow("down");
});

test("a page that fails once is read again", async () => {
  let fails = 1;
  const api = { tokens: { list: async () => { if (fails-- > 0) throw new Error("blip"); return { data: [], meta: { total: 0 } }; } } } as unknown as ApiClient;
  expect(await sitemapEntries(api, { kind: "tokens", index: 0 }, "https://x.test")).toEqual([]);
});

test("the index lists every sitemap", () => {
  const xml = sitemapIndexXml(["https://x.test/sitemap/0.xml", "https://x.test/sitemap/1.xml"]);
  expect(xml).toContain("<loc>https://x.test/sitemap/0.xml</loc>");
  expect(xml).toContain("<loc>https://x.test/sitemap/1.xml</loc>");
});
