const PLATFORM_DEFAULT = "https://medialane.io";

export function webAddress(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

export function externalLink(url?: string | null): string | null {
  const address = webAddress(url);
  return address && address !== `${PLATFORM_DEFAULT}/` ? address : null;
}
