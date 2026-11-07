import { UPLOAD_LIMITS } from "../../utils/upload-limits.js";
import type { IPType } from "../../data/ip.js";
import type { MediaKind } from "./types.js";

export const MEDIA_ROUTE_MIME_TYPES = new Set(UPLOAD_LIMITS.media.mimeTypes);
const DOCUMENT_MIME_TYPES = new Set(UPLOAD_LIMITS.document.mimeTypes.filter((type) => type !== "application/octet-stream"));

export function detectMediaKind(mime: string): MediaKind | null {
  if (mime.startsWith("image/")) return MEDIA_ROUTE_MIME_TYPES.has(mime) ? "image" : null;
  if (mime.startsWith("video/")) return MEDIA_ROUTE_MIME_TYPES.has(mime) ? "video" : null;
  if (mime.startsWith("audio/")) return MEDIA_ROUTE_MIME_TYPES.has(mime) ? "audio" : null;
  if (DOCUMENT_MIME_TYPES.has(mime)) return "document";
  return null;
}

export const IP_TYPE_BY_KIND: Record<MediaKind, IPType> = {
  image: "NFT",
  audio: "Audio",
  video: "Video",
  document: "Documents",
};
