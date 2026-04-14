const DEFAULT_GATEWAY = "https://ipfs.io/ipfs/";

/**
 * Convert an IPFS URI to an HTTP URL.
 * Accepts ipfs://<cid>, ipfs://<cid>/<path>, or plain HTTP URLs (returned as-is).
 *
 * @param uri - The IPFS URI or HTTP URL to convert.
 * @param gateway - Gateway base URL (default: ipfs.io). Should end without a trailing slash.
 */
export function ipfsToHttp(
  uri: string | null | undefined,
  gateway = DEFAULT_GATEWAY
): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", gateway);
  }
  return uri;
}
