"use client";

import Link from "./link.js";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ExpandableText } from "./expandable-text.js";
import { getEmbedSrc } from "./ip-type-display.js";
import { EMBED_PLATFORM_META, type EmbedPlatform } from "../data/ip-templates.js";

interface Attr {
  trait_type?: string;
  value?: string;
}

const VIDEO_PLATFORMS: EmbedPlatform[] = ["youtube", "vimeo", "tiktok"];

export const VIDEO_EMBED_TRAITS = new Set<string>(VIDEO_PLATFORMS.map((p) => EMBED_PLATFORM_META[p].traitKey));

export function videoEmbed(attributes: Attr[]): { src: string; label: string } | null {
  for (const platform of VIDEO_PLATFORMS) {
    const meta = EMBED_PLATFORM_META[platform];
    const value = attributes.find((a) => a.trait_type === meta.traitKey)?.value;
    const src = value ? getEmbedSrc(platform, value) : null;
    if (src) return { src, label: meta.label };
  }
  return null;
}

export interface AssetVideoProps {
  name: string;
  embedSrc: string;
  embedLabel: string;
  description?: string | null;
  collectionName: string;
  collectionImage?: string | null;
  collectionHref: string;
  utilities: ReactNode;
}

export function AssetVideo({ name, embedSrc, embedLabel, description, collectionName, collectionImage, collectionHref, utilities }: AssetVideoProps) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embedSrc}
          title={embedLabel}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <h1 className="text-xl lg:text-2xl font-bold break-words">{name}</h1>

      <div className="flex items-center justify-between gap-3">
        <Link href={collectionHref} className="flex min-w-0 items-center gap-3 hover:text-primary transition-colors">
          {collectionImage ? <img src={collectionImage} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : null}
          <span className="truncate text-sm font-semibold">{collectionName}</span>
        </Link>
        {utilities}
      </div>

      {description ? (
        <div className="rounded-2xl bg-muted/30 p-4">
          <ExpandableText text={description} />
        </div>
      ) : null}
    </div>
  );
}

export interface AssetRelatedItem {
  tokenId: string;
  name: string;
  image: string | null;
  href: string;
}

export function AssetRelatedList({ title, titleHref, items, shape = "video" }: { title: string; titleHref: string; items: AssetRelatedItem[]; shape?: "video" | "square" }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <Link href={titleHref} className="flex items-center justify-between gap-2 text-sm font-semibold hover:text-primary transition-colors">
        <span className="truncate">More from {title}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Link>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.tokenId}>
            <Link href={item.href} className="group flex gap-3">
              <div className={shape === "square" ? "aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-muted/40" : "aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-muted/40"}>
                {item.image ? <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
              </div>
              <p className={shape === "square" ? "min-w-0 self-center text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors" : "min-w-0 text-sm font-medium leading-snug line-clamp-3 group-hover:text-primary transition-colors"}>{item.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
