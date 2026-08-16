const MEDIA_BASE_URL = "https://medialane-backend-production.up.railway.app";
const DEFAULT_GATEWAY = `${MEDIA_BASE_URL}/media/ipfs/`;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "ipfs:"]);

export function ipfsToHttp(
  uri: string | null | undefined,
  gateway = DEFAULT_GATEWAY
): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", gateway);
  }
  if (uri.startsWith(MEDIA_BASE_URL)) {
    return uri;
  }
  try {
    const { protocol } = new URL(uri);
    if (!ALLOWED_PROTOCOLS.has(protocol)) return "";
  } catch {
    return "";
  }
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return `${MEDIA_BASE_URL}/media/external?url=${encodeURIComponent(uri)}`;
  }
  return uri;
}
