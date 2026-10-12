const urls = new WeakMap<File, string>();

/** One object URL per picked file, reused across renders. */
export function previewUrl(file: File): string {
  let url = urls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    urls.set(file, url);
  }
  return url;
}
