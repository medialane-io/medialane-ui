"use client";

import Link from "./link.js";
import type { ReactNode } from "react";
import { ExpandableText } from "./expandable-text.js";
import { getEmbedSrc } from "./ip-type-display.js";
import { EMBED_PLATFORM_META, type EmbedPlatform } from "../data/ip-templates.js";

interface Attr {
  trait_type?: string;
  value?: string;
}

const AUDIO_PLATFORMS: EmbedPlatform[] = ["spotify", "soundcloud"];

export const AUDIO_EMBED_TRAITS = new Set<string>(AUDIO_PLATFORMS.map((p) => EMBED_PLATFORM_META[p].traitKey));

export function audioEmbed(attributes: Attr[]): { src: string; label: string } | null {
  for (const platform of AUDIO_PLATFORMS) {
    const meta = EMBED_PLATFORM_META[platform];
    const value = attributes.find((a) => a.trait_type === meta.traitKey)?.value;
    const src = value ? getEmbedSrc(platform, value) : null;
    if (src) return { src, label: meta.label };
  }
  return null;
}

export interface AssetAudioProps {
  name: string;
  image: string | null;
  embedSrc: string;
  embedLabel: string;
  description?: string | null;
  collectionName: string;
  collectionImage?: string | null;
  collectionHref: string;
  utilities: ReactNode;
}

export function AssetAudio({ name, image, embedSrc, embedLabel, description, collectionName, collectionImage, collectionHref, utilities }: AssetAudioProps) {
  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        {image ? <img src={image} alt={name} className="aspect-square w-full max-w-xs shrink-0 rounded-2xl object-cover sm:w-56" /> : null}
        <h1 className="min-w-0 text-2xl lg:text-4xl font-bold break-words">{name}</h1>
      </div>

      <iframe
        src={embedSrc}
        title={embedLabel}
        className="w-full rounded-xl border-0"
        height={166}
        allow="autoplay; encrypted-media"
        loading="lazy"
      />

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
