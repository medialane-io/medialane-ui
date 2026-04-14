/** Server-safe IP type data — no React components, safe to import in Server Components. */
export interface IpTypeData {
  slug: string;
  label: string;
  /** API ipType value — null means "nft" special case */
  apiValue: string | null;
  colorClass: string;
  bgClass: string;
}

export const IP_TYPE_DATA: IpTypeData[] = [
  { slug: "audio",        label: "Audio",        apiValue: "Audio",        colorClass: "text-violet-400",  bgClass: "bg-violet-500/10"  },
  { slug: "video",        label: "Video",        apiValue: "Video",        colorClass: "text-red-400",     bgClass: "bg-red-500/10"     },
  { slug: "art",          label: "Art",          apiValue: "Art",          colorClass: "text-pink-400",    bgClass: "bg-pink-500/10"    },
  { slug: "photography",  label: "Photography",  apiValue: "Photography",  colorClass: "text-amber-400",   bgClass: "bg-amber-500/10"   },
  { slug: "nft",          label: "NFT",          apiValue: null,           colorClass: "text-blue-400",    bgClass: "bg-blue-500/10"    },
  { slug: "software",     label: "Software",     apiValue: "Software",     colorClass: "text-cyan-400",    bgClass: "bg-cyan-500/10"    },
  { slug: "rwa",          label: "RWA",          apiValue: "RWA",          colorClass: "text-lime-400",    bgClass: "bg-lime-500/10"    },
  { slug: "patents",      label: "Patents",      apiValue: "Patents",      colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10" },
  { slug: "posts",        label: "Posts",        apiValue: "Posts",        colorClass: "text-orange-400",  bgClass: "bg-orange-500/10"  },
  { slug: "publications", label: "Publications", apiValue: "Publications", colorClass: "text-teal-400",    bgClass: "bg-teal-500/10"    },
  { slug: "documents",    label: "Documents",    apiValue: "Documents",    colorClass: "text-slate-400",   bgClass: "bg-slate-500/10"   },
  { slug: "custom",       label: "Custom",       apiValue: "Custom",       colorClass: "text-indigo-400",  bgClass: "bg-indigo-500/10"  },
];

export const IP_TYPE_DATA_MAP = Object.fromEntries(
  IP_TYPE_DATA.map((d) => [d.slug, d])
) as Record<string, IpTypeData>;
