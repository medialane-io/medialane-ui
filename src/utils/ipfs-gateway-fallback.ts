import { IPFS_PUBLIC_GATEWAYS } from "@medialane/sdk";

export const PUBLIC_IMAGE_GATEWAYS: readonly string[] = IPFS_PUBLIC_GATEWAYS.map((gateway) => `${gateway}/`);

export function gatewayChain(primary: string, fallbacks: readonly string[] = PUBLIC_IMAGE_GATEWAYS): string[] {
  return [...new Set([primary, ...fallbacks])];
}

export function gatewayFallbackSrc(src: string, chain: readonly string[]): string | null {
  const at = chain.findIndex((gateway) => src.startsWith(gateway));
  if (at < 0 || at === chain.length - 1) return null;
  return chain[at + 1] + src.slice(chain[at]!.length).split("?")[0];
}

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
