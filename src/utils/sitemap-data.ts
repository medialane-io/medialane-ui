import { assetHref, collectionHref, type ApiClient } from "@medialane/sdk";

export type SitemapKind = "tokens" | "collections" | "creators";

export interface SitemapChunk {
  kind: SitemapKind;
  index: number;
}

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency: "weekly";
  priority: number;
}

const READS = {
  tokens: { pageSize: 48, pagesPerChunk: 40 },
  collections: { pageSize: 100, pagesPerChunk: 20 },
  creators: { pageSize: 50, pagesPerChunk: 40 },
} as const;

const KINDS = Object.keys(READS) as SitemapKind[];

async function read<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch {
    return load();
  }
}

async function total(api: ApiClient, kind: SitemapKind): Promise<number> {
  if (kind === "tokens") return (await read(() => api.tokens.list({ limit: 1 }))).meta?.total ?? 0;
  if (kind === "collections") return (await read(() => api.collections.list({ limit: 1 }))).meta?.total ?? 0;
  return (await read(() => api.creators.list({ limit: 1 }))).total ?? 0;
}

/** One chunk per slice of 1,920–2,000 rows, so each sitemap file stays cheap to build and the lists have no cap. */
export async function sitemapChunks(api: ApiClient): Promise<SitemapChunk[]> {
  const totals = await Promise.all(KINDS.map((kind) => total(api, kind)));
  return KINDS.flatMap((kind, i) => {
    const { pageSize, pagesPerChunk } = READS[kind];
    return Array.from({ length: Math.ceil(totals[i]! / (pageSize * pagesPerChunk)) }, (_, index) => ({ kind, index }));
  });
}

/** The entries of one chunk; throws if a page cannot be read, so a partial list is never published. */
export async function sitemapEntries(api: ApiClient, { kind, index }: SitemapChunk, baseUrl: string): Promise<SitemapEntry[]> {
  const { pageSize, pagesPerChunk } = READS[kind];
  const first = index * pagesPerChunk + 1;
  const pages = Array.from({ length: pagesPerChunk }, (_, i) => first + i);
  const entries: SitemapEntry[] = [];

  for (const page of pages) {
    if (kind === "tokens") {
      const { data } = await read(() => api.tokens.list({ page, limit: pageSize, sort: "oldest" }));
      for (const t of data ?? []) {
        entries.push({
          url: `${baseUrl}${assetHref("STARKNET", t.contractAddress, t.tokenId)}`,
          lastModified: t.updatedAt ? new Date(t.updatedAt) : undefined,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
      if ((data?.length ?? 0) < pageSize) break;
    } else if (kind === "collections") {
      const { data } = await read(() => api.collections.list({ page, limit: pageSize }));
      for (const c of data ?? []) {
        entries.push({
          url: `${baseUrl}${collectionHref("STARKNET", c.contractAddress)}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      if ((data?.length ?? 0) < pageSize) break;
    } else {
      const { creators } = await read(() => api.creators.list({ page, limit: pageSize }));
      for (const c of creators ?? []) {
        if (c.username) entries.push({ url: `${baseUrl}/creator/${c.username}`, changeFrequency: "weekly", priority: 0.6 });
      }
      if ((creators?.length ?? 0) < pageSize) break;
    }
  }
  return entries;
}

export function sitemapIndexXml(urls: string[]): string {
  const items = urls.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}
