import type { ApiClient } from "@medialane/sdk";

export interface SitemapData {
  collections: { contractAddress: string; updatedAt?: string }[];
  tokens: { contractAddress: string; tokenId: string; updatedAt?: string }[];
  creatorUsernames: string[];
}

export interface SitemapLimits {
  collections: number;
  tokens: number;
  creators: number;
}

const DEFAULT_LIMITS: SitemapLimits = { collections: 500, tokens: 2000, creators: 500 };

/** Reads pages until a short page or `max` rows; a failed page ends the list with what was read so far. */
async function pages<T>(max: number, pageSize: number, read: (page: number) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; rows.length < max; page++) {
    let batch: T[];
    try {
      batch = await read(page);
    } catch {
      break;
    }
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }
  return rows.slice(0, max);
}

/** Everything a sitemap lists, paged through the backend's list caps. */
export async function collectSitemapData(api: ApiClient, limits: SitemapLimits = DEFAULT_LIMITS): Promise<SitemapData> {
  const [collections, tokens, creators] = await Promise.all([
    pages(limits.collections, 100, async (page) => (await api.listCollections({ page, limit: 100 })).data ?? []),
    pages(limits.tokens, 48, async (page) => (await api.getTokens({ page, limit: 48 })).data ?? []),
    pages(limits.creators, 50, async (page) => (await api.getCreators({ page, limit: 50 })).creators ?? []),
  ]);
  return {
    collections,
    tokens,
    creatorUsernames: creators.map((c) => c.username).filter((u): u is string => Boolean(u)),
  };
}
