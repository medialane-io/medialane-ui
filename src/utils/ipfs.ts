export const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "ipfs:"]);

const KNOWN_IPFS_GATEWAY_HOSTS = /(^|\.)(mypinata\.cloud|pinata\.cloud|ipfs\.io|dweb\.link|cloudflare-ipfs\.com|nftstorage\.link|w3s\.link)$/i;

const DEFAULT_WIDTH = 1200;

function withSize(url: string, gateway: string, width: number | null): string {
  if (!width || !url.startsWith(gateway)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}img-width=${width}&img-format=webp&img-quality=80`;
}

export function ipfsToHttp(
  uri: string | null | undefined,
  opts: { gateway?: string; width?: number | null } = {}
): string {
  const gateway = opts.gateway ?? DEFAULT_GATEWAY;
  const width = opts.width === undefined ? DEFAULT_WIDTH : opts.width;

  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return withSize(uri.replace("ipfs://", gateway), gateway, width);
  }
  if (uri.startsWith("data:image/")) {
    return uri;
  }
  try {
    const parsed = new URL(uri);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return "";

    if (KNOWN_IPFS_GATEWAY_HOSTS.test(parsed.hostname)) {
      const match = parsed.pathname.match(/\/ipfs\/(.+)$/);
      if (match) return withSize(`${gateway}${match[1]}`, gateway, width);
    }
  } catch {
    return "";
  }
  return uri;
}
