export async function shareOrCopy(title: string, url?: string): Promise<"shared" | "copied" | "none"> {
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  if (typeof navigator === "undefined") return "none";
  if (navigator.share) {
    try {
      await navigator.share({ title, url: shareUrl });
      return "shared";
    } catch {
      return "none";
    }
  }
  await navigator.clipboard.writeText(shareUrl);
  return "copied";
}
