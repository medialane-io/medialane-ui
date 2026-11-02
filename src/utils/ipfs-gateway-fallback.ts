/**
 * The same IPFS path on the fallback gateway, or null when `src` is not served by `primary`.
 * The query is dropped: resize options are specific to the primary gateway.
 */
export function gatewayFallbackSrc(src: string, primary: string, fallback: string): string | null {
  if (primary === fallback || !src.startsWith(primary)) return null;
  return fallback + src.slice(primary.length).split("?")[0];
}

/**
 * When an image from `primary` fails to load, loads the same file from `fallback` instead.
 *
 * Listens for image errors on the whole document (they reach it in the capture phase), so it
 * covers every image whichever component renders it. The switched image's own error handlers
 * do not run; if the fallback fails as well, they do. Returns a function that uninstalls it.
 */
export function installIpfsGatewayFallback(primary: string, fallback: string, root: Document = document): () => void {
  const onError = (event: Event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    const next = gatewayFallbackSrc(img.getAttribute("src") ?? "", primary, fallback);
    if (!next) return;
    event.stopPropagation();
    img.removeAttribute("srcset");
    img.setAttribute("src", next);
  };
  root.addEventListener("error", onError, true);
  return () => root.removeEventListener("error", onError, true);
}
