import { msg } from "../i18n/translate.js";
import { BRAND } from "./brand.js";

export interface IpTypeData {
  slug: string;
  label: string;

  apiValue: string | null;
  colorClass: string;
  bgClass: string;
}

const brand = (color: keyof typeof BRAND) => ({ colorClass: BRAND[color].text, bgClass: BRAND[color].bg });

export const IP_TYPE_DATA: IpTypeData[] = [
  { slug: "audio",        label: msg("Audio"),        apiValue: "Audio",        ...brand("purple") },
  { slug: "video",        label: msg("Video"),        apiValue: "Video",        ...brand("rose") },
  { slug: "art",          label: msg("Art"),          apiValue: "Art",          ...brand("maeve") },
  { slug: "photography",  label: msg("Photography"),  apiValue: "Photography",  ...brand("orange") },
  { slug: "nft",          label: msg("NFT"),          apiValue: null,           ...brand("blue") },
  { slug: "rwa",          label: msg("RWA"),          apiValue: "RWA",          ...brand("blue") },
  { slug: "posts",        label: msg("Posts"),        apiValue: "Posts",        ...brand("orange") },
  { slug: "publications", label: msg("Publications"), apiValue: "Publications", ...brand("purple") },
  { slug: "documents",    label: msg("Documents"),    apiValue: "Documents",    colorClass: "text-muted-foreground", bgClass: "bg-muted" },
];

export const IP_TYPE_DATA_MAP = Object.fromEntries(
  IP_TYPE_DATA.map((d) => [d.slug, d])
) as Record<string, IpTypeData>;
