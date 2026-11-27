import { normalizeAddress, type ApiClient } from "@medialane/sdk";
import { toAbsoluteImageUrl } from "./ipfs.js";

const DETAIL_REVALIDATE_SECONDS = 300;
const LIST_REVALIDATE_SECONDS = 60;
const FAILED_READ_REVALIDATE_SECONDS = 1;
const ABSENT_STATUSES = new Set<unknown>([400, 404]);

export type ServerReadCache = <T extends (...args: any[]) => Promise<any>>(
  read: T,
  key: string[],
  options: { revalidate: number },
) => T;

export interface ServerReadsOptions {
  api: () => ApiClient;
  cache: ServerReadCache;
  backendUrl: string;
  absoluteUrl: (path: string) => string;
}

const isAbsent = (error: unknown) => ABSENT_STATUSES.has((error as { status?: unknown } | null)?.status);

function isAddress(value: string): boolean {
  try {
    normalizeAddress("STARKNET", value);
    return true;
  } catch {
    return false;
  }
}

export function createServerReads({ api, cache, backendUrl, absoluteUrl }: ServerReadsOptions) {
  const backendOrigin = new URL(backendUrl).origin;
  const expireSoon = cache(async () => null, ["failed-read"], { revalidate: FAILED_READ_REVALIDATE_SECONDS });

  function cached<A extends (string | number)[], T>(
    name: string,
    read: (...args: A) => Promise<T>,
    revalidate = DETAIL_REVALIDATE_SECONDS,
  ): (...args: A) => Promise<T | null> {
    const load = cache(
      async (...args: A): Promise<T | null> => {
        try {
          return await read(...args);
        } catch (error) {
          if (isAbsent(error)) return null;
          throw error;
        }
      },
      [name],
      { revalidate },
    );
    return async (...args: A) => {
      try {
        return await load(...args);
      } catch {
        return expireSoon();
      }
    };
  }

  const atAddress = <A extends [string, ...(string | number)[]], T>(read: (...args: A) => Promise<T>) =>
    async (...args: A): Promise<T | null> => (isAddress(args[0]) ? read(...args) : null);

  return {
    ipfsToHttpServer(uri: string | null | undefined): string {
      const url = toAbsoluteImageUrl(uri);
      return url.startsWith(`${backendOrigin}/`) ? absoluteUrl(`/api/img?url=${encodeURIComponent(url)}`) : url;
    },
    fetchTokenMeta: cached("token-meta", atAddress((contract: string, tokenId: string) => api().tokens.get(contract, tokenId))),
    fetchCollectionMeta: cached("collection-meta", atAddress((contract: string) => api().collections.get(contract))),
    fetchCollectionBySlug: cached("collection-by-slug", (slug: string) => api().collections.findBySlug(slug)),
    fetchDropMeta: cached("drop-meta", atAddress((contract: string) => api().drops.find(contract))),
    fetchCoinMeta: cached("coin-meta", atAddress((contract: string) => api().coins.get(contract))),
    fetchCreatorProfile: cached("creator-profile", (username: string) => api().creators.findByUsername(username)),
    fetchFeaturedCollections: cached(
      "featured-collections",
      async (limit: number) =>
        (await api().collections.list({ page: 1, limit, sort: "recent", isFeatured: true, hideEmpty: true })).data,
      LIST_REVALIDATE_SECONDS,
    ),
    fetchActiveOrders: cached(
      "active-orders",
      async (limit: number) => (await api().orders.list({ status: "ACTIVE", sort: "recent", page: 1, limit })).data,
      LIST_REVALIDATE_SECONDS,
    ),
  };
}
