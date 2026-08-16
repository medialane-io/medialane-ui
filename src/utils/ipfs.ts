const DEFAULT_GATEWAY = "/api/ipfs/";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "ipfs:"]);

export function ipfsToHttp(
  uri: string | null | undefined,
  gateway = DEFAULT_GATEWAY
): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", gateway);
  }
  try {
    const { protocol } = new URL(uri);
    if (!ALLOWED_PROTOCOLS.has(protocol)) return "";
  } catch {
    return "";
  }
  return uri;
}
