// IPFS content is public by CID — there is nothing to protect by proxying it
// through our own servers. Pinata's default public gateway serves any CID
// with no token, no signing, no app-server hop.
const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "ipfs:"]);

const KNOWN_IPFS_GATEWAY_HOSTS = /(^|\.)(mypinata\.cloud|pinata\.cloud|ipfs\.io|dweb\.link|cloudflare-ipfs\.com|nftstorage\.link|w3s\.link)$/i;

export function ipfsToHttp(
  uri: string | null | undefined,
  gateway = DEFAULT_GATEWAY
): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", gateway);
  }
  if (uri.startsWith("data:image/")) {
    return uri;
  }
  try {
    const parsed = new URL(uri);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return "";

    if (KNOWN_IPFS_GATEWAY_HOSTS.test(parsed.hostname)) {
      const match = parsed.pathname.match(/\/ipfs\/(.+)$/);
      if (match) return `${gateway}${match[1]}`;
    }
  } catch {
    return "";
  }
  return uri;
}
