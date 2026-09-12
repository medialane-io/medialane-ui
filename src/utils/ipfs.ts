export const PUBLIC_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export function gatewayFrom(host: string | undefined): string {
  const trimmed = host?.trim();
  if (!trimmed) return PUBLIC_GATEWAY;
  const bare = trimmed.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${bare}/ipfs/`;
}

export const DEFAULT_GATEWAY = gatewayFrom(process.env.NEXT_PUBLIC_IPFS_GATEWAY);

export const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_IPFS_GATEWAY_TOKEN?.trim() ?? "";

function withToken(url: string, gateway: string): string {
  if (!GATEWAY_TOKEN || !url.startsWith(gateway)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}pinataGatewayToken=${GATEWAY_TOKEN}`;
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "ipfs:"]);

const KNOWN_IPFS_GATEWAY_HOSTS = /(^|\.)(mypinata\.cloud|pinata\.cloud|ipfs\.io|dweb\.link|cloudflare-ipfs\.com|nftstorage\.link|w3s\.link)$/i;

const DEFAULT_WIDTH = 1200;

function withSize(url: string, gateway: string, width: number | null): string {
  if (!url.startsWith(gateway)) return url;
  const sized = width
    ? `${url}${url.includes("?") ? "&" : "?"}img-width=${width}&img-format=webp&img-quality=80`
    : url;
  return withToken(sized, gateway);
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

export interface DisplayUrlOptions {
  gateway?: string;
  proxyPath?: string;
  placeholder?: string;
}

export function toDisplayUrl(
  uri: string | null | undefined,
  opts: DisplayUrlOptions = {},
): string {
  const gateway = opts.gateway ?? DEFAULT_GATEWAY;
  const placeholder = opts.placeholder ?? "/placeholder.svg";
  const proxyPath = opts.proxyPath ?? "/api/img";

  if (!uri) return placeholder;
  if (uri.startsWith("data:image/")) return uri;

  const resolved = ipfsToHttp(uri, { gateway });
  if (resolved.startsWith(gateway)) return resolved;

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return `${proxyPath}?url=${encodeURIComponent(uri)}`;
  }

  return placeholder;
}

export function toDisplayUrlOrNull(
  raw: string | null | undefined,
  opts: DisplayUrlOptions = {},
): string | null {
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  return toDisplayUrl(raw, opts);
}

export function toAbsoluteImageUrl(uri: string | null | undefined): string {
  if (!uri) return "";
  return ipfsToHttp(uri) || "";
}
