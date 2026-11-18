import { msg } from "../i18n/translate.js";

export interface IpTypeData {
  slug: string;
  label: string;

  apiValue: string | null;
  colorClass: string;
  bgClass: string;
}

export const IP_TYPE_DATA: IpTypeData[] = [
  { slug: "audio",        label: msg("Audio"),        apiValue: "Audio",        colorClass: "text-violet-400",  bgClass: "bg-violet-500/10"  },
  { slug: "video",        label: msg("Video"),        apiValue: "Video",        colorClass: "text-red-400",     bgClass: "bg-red-500/10"     },
  { slug: "art",          label: msg("Art"),          apiValue: "Art",          colorClass: "text-pink-400",    bgClass: "bg-pink-500/10"    },
  { slug: "photography",  label: msg("Photography"),  apiValue: "Photography",  colorClass: "text-amber-400",   bgClass: "bg-amber-500/10"   },
  { slug: "nft",          label: msg("NFT"),          apiValue: null,           colorClass: "text-blue-400",    bgClass: "bg-blue-500/10"    },
  { slug: "rwa",          label: msg("RWA"),          apiValue: "RWA",          colorClass: "text-lime-400",    bgClass: "bg-lime-500/10"    },
  { slug: "posts",        label: msg("Posts"),        apiValue: "Posts",        colorClass: "text-orange-400",  bgClass: "bg-orange-500/10"  },
  { slug: "publications", label: msg("Publications"), apiValue: "Publications", colorClass: "text-teal-400",    bgClass: "bg-teal-500/10"    },
  { slug: "documents",    label: msg("Documents"),    apiValue: "Documents",    colorClass: "text-slate-400",   bgClass: "bg-slate-500/10"   },
];

export const IP_TYPE_DATA_MAP = Object.fromEntries(
  IP_TYPE_DATA.map((d) => [d.slug, d])
) as Record<string, IpTypeData>;
