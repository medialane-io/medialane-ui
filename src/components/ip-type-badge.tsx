"use client";

import {
  Music, Palette, Film, Camera, Gem, Award,
  FileText, BookOpen, File, Building, Code, Layers,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { IP_TYPE_DATA, IP_TYPE_DATA_MAP } from "../data/ip-types.js";
import type { IpTypeData } from "../data/ip-types.js";

/** Client-only: extends IpTypeData with a React icon component. */
export interface IpTypeConfig extends IpTypeData {
  icon: React.ElementType;
}

export const IP_TYPE_CONFIG: IpTypeConfig[] = IP_TYPE_DATA.map((d) => {
  const icons: Record<string, React.ElementType> = {
    audio: Music,
    video: Film,
    art: Palette,
    photography: Camera,
    nft: Gem,
    software: Code,
    rwa: Building,
    patents: Award,
    posts: FileText,
    publications: BookOpen,
    documents: File,
    custom: Layers,
  };
  return { ...d, icon: icons[d.slug] ?? Layers };
});

export const IP_TYPE_MAP = Object.fromEntries(
  IP_TYPE_CONFIG.map((c) => [c.slug, c])
) as Record<string, IpTypeConfig>;

// Re-export server-safe data so consumers only need one import path
export { IP_TYPE_DATA, IP_TYPE_DATA_MAP };
export type { IpTypeData };

const SIZE = {
  sm: { container: "h-6 w-6", icon: "h-3 w-3" },
  md: { container: "h-8 w-8", icon: "h-4 w-4" },
};

export interface IpTypeBadgeProps {
  ipType: string;
  size?: "sm" | "md";
  className?: string;
  /** Base URL for IP type pages. Default: "" (relative). */
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
