import { IPFS_PUBLIC_GATEWAYS } from "@medialane/sdk";

/** The public IPFS gateways, in the form image URLs use: `${gateway}${cid}/${path}`. */
export const PUBLIC_IMAGE_GATEWAYS: readonly string[] = IPFS_PUBLIC_GATEWAYS.map((gateway) => `${gateway}/`);

/** `primary` followed by the public gateways, without repeats. */
export function gatewayChain(primary: string, fallbacks: readonly string[] = PUBLIC_IMAGE_GATEWAYS): string[] {
  return [...new Set([primary, ...fallbacks])];
}

/**
 * The same IPFS path on the next gateway of `chain`, or null when `src` is not served by a gateway
 * of the chain or is already on the last one. The query is dropped: resize options are specific to
 * the gateway that served the image.
 */
export function gatewayFallbackSrc(src: string, chain: readonly string[]): string | null {
  const at = chain.findIndex((gateway) => src.startsWith(gateway));
  if (at < 0 || at === chain.length - 1) return null;
  return chain[at + 1] + src.slice(chain[at]!.length).split("?")[0];
}

/**
 * When an image from a gateway of `chain` fails to load, loads the same file from the next one.
 *
 * Listens for image errors on the whole document (they reach it in the capture phase), so it
 * covers every image whichever component renders it. The switched image's own error handlers
 * do not run; once the last gateway fails as well, they do. Images that already failed before it
 * was installed (a server-rendered image can fail before the page hydrates) are switched at once.
 * Returns a function that uninstalls it.
 */
export function installIpfsGatewayFallback(chain: readonly string[], root: Document = document): () => void {
  const switchToNext = (img: HTMLImageElement): boolean => {
    const next = gatewayFallbackSrc(img.getAttribute("src") ?? "", chain);
    if (!next) return false;
    img.removeAttribute("srcset");
    img.setAttribute("src", next);
    return true;
  };
  const onError = (event: Event) => {
    if (event.target instanceof HTMLImageElement && switchToNext(event.target)) event.stopPropagation();
  };
  root.addEventListener("error", onError, true);
  for (const img of Array.from(root.querySelectorAll("img"))) {
    if (img.complete && img.naturalWidth === 0) switchToNext(img);
  }
  return () => root.removeEventListener("error", onError, true);
}
