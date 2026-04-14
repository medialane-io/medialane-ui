"use client";

import {
  Music, Palette, Film, Camera, Gem, Award,
  FileText, BookOpen, File, Building, Code, Layers,
} from "lucide-react";
import { cn } from "../utils/cn.js";

export interface IpTypeConfig {
  slug: string;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  /** API ipType value — null means "nft" special case */
  apiValue: string | null;
}

export const IP_TYPE_CONFIG: IpTypeConfig[] = [
  { slug: "audio",        label: "Audio",        icon: Music,    colorClass: "text-violet-400",  bgClass: "bg-violet-500/10",  apiValue: "Audio" },
  { slug: "video",        label: "Video",        icon: Film,     colorClass: "text-red-400",     bgClass: "bg-red-500/10",     apiValue: "Video" },
  { slug: "art",          label: "Art",          icon: Palette,  colorClass: "text-pink-400",    bgClass: "bg-pink-500/10",    apiValue: "Art" },
  { slug: "photography",  label: "Photography",  icon: Camera,   colorClass: "text-amber-400",   bgClass: "bg-amber-500/10",   apiValue: "Photography" },
  { slug: "nft",          label: "NFT",          icon: Gem,      colorClass: "text-blue-400",    bgClass: "bg-blue-500/10",    apiValue: null },
  { slug: "software",     label: "Software",     icon: Code,     colorClass: "text-cyan-400",    bgClass: "bg-cyan-500/10",    apiValue: "Software" },
  { slug: "rwa",          label: "RWA",          icon: Building, colorClass: "text-lime-400",    bgClass: "bg-lime-500/10",    apiValue: "RWA" },
  { slug: "patents",      label: "Patents",      icon: Award,    colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", apiValue: "Patents" },
  { slug: "posts",        label: "Posts",        icon: FileText, colorClass: "text-orange-400",  bgClass: "bg-orange-500/10",  apiValue: "Posts" },
  { slug: "publications", label: "Publications", icon: BookOpen, colorClass: "text-teal-400",    bgClass: "bg-teal-500/10",    apiValue: "Publications" },
  { slug: "documents",    label: "Documents",    icon: File,     colorClass: "text-slate-400",   bgClass: "bg-slate-500/10",   apiValue: "Documents" },
  { slug: "custom",       label: "Custom",       icon: Layers,   colorClass: "text-indigo-400",  bgClass: "bg-indigo-500/10",  apiValue: "Custom" },
];

export const IP_TYPE_MAP = Object.fromEntries(
  IP_TYPE_CONFIG.map((c) => [c.slug, c])
) as Record<string, IpTypeConfig>;

const SIZE = {
  sm: { container: "h-6 w-6", icon: "h-3 w-3" },
  md: { container: "h-8 w-8", icon: "h-4 w-4" },
};

export interface IpTypeBadgeProps {
  ipType: string;
  size?: "sm" | "md";
  className?: string;
  /** Base URL for IP type pages. Default: "" (relative). Example: "https://medialane.io" */
  baseUrl?: string;
}

export function IpTypeBadge({ ipType, size = "sm", className, baseUrl = "" }: IpTypeBadgeProps) {
  const config = IP_TYPE_CONFIG.find(
    (c) => c.label === ipType || c.apiValue === ipType
  );
  if (!config) return null;
  const { icon: Icon, colorClass, bgClass, slug, label } = config;
  const { container, icon } = SIZE[size];
  return (
    <a
      href={`${baseUrl}/${slug}`}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "transition-opacity hover:opacity-80",
        bgClass,
        container,
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className={cn(colorClass, icon)} />
    </a>
  );
}
