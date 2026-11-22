"use client";

import type { IPType } from "../data/ip.js";
import {
  IP_TEMPLATES,
  EMBED_PLATFORM_META,
  SOCIAL_PLATFORM_META,
  type EmbedPlatform,
} from "../data/ip-templates.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { PANEL_INSET } from "./panel.js";
import { cn } from "../utils/cn.js";

interface Attr {
  trait_type?: string | null;
  value?: string | null;
}

interface IPTypeDisplayProps {
  attributes: Attr[] | null | undefined;
}

function parseYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v");
    }
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

function parseSpotifyEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;

    const match = u.pathname.match(
      /(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/
    );
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  } catch {
    return null;
  }
}

function parseSoundCloudEmbed(url: string): string | null {
  try {
    new URL(url);
    if (!url.includes("soundcloud.com")) return null;
    const encoded = encodeURIComponent(url);
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`;
  } catch {
    return null;
  }
}

function parseTikTokEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("tiktok.com")) return null;
    const match = u.pathname.match(/\/video\/(\d+)/);
    if (!match) return null;
    return `https://www.tiktok.com/embed/v2/${match[1]}`;
  } catch {
    return null;
  }
}

function parseVimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const match = u.pathname.match(/(\d+)/);
    if (!match) return null;
    return `https://player.vimeo.com/video/${match[1]}`;
  } catch {
    return null;
  }
}

export function getEmbedSrc(platform: EmbedPlatform, value: string): string | null {
  switch (platform) {
    case "youtube":    return parseYouTubeEmbed(value);
    case "spotify":    return parseSpotifyEmbed(value);
    case "soundcloud": return parseSoundCloudEmbed(value);
    case "tiktok":     return parseTikTokEmbed(value);
    case "vimeo":      return parseVimeoEmbed(value);
  }
}

const COMPACT: Record<EmbedPlatform, boolean> = {
  spotify: true,
  soundcloud: true,
  youtube: false,
  tiktok: false,
  vimeo: false,
};

export function IPTypeDisplay({ attributes }: IPTypeDisplayProps) {
  const t = useT();
  const attrs = attributes ?? [];

  const ipType = attrs.find(
    (a) => a.trait_type?.toLowerCase() === "ip type"
  )?.value as IPType | undefined;
  if (!ipType) return null;

  const template = IP_TEMPLATES[ipType];
  if (!template) return null;

  const getAttr = (key: string) =>
    attrs.find((a) => a.trait_type === key)?.value ?? null;

  const embeds = (template.embeds ?? []).flatMap((platform) => {
    const meta = EMBED_PLATFORM_META[platform];
    const value = getAttr(meta.traitKey);
    return value ? [{ platform, meta, value }] : [];
  });

  const socials = (template.socials ?? []).flatMap((platform) => {
    const meta = SOCIAL_PLATFORM_META[platform];
    const value = getAttr(meta.traitKey);
    return value ? [{ platform, meta, value }] : [];
  });

  const docUri = template.docUpload ? getAttr(template.docUpload.traitType) : null;

  if (embeds.length === 0 && socials.length === 0 && !docUri) return null;

  return (
    <div className="space-y-5">

      {docUri && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("Document")}
          </p>
          <a
            href={docUri.startsWith("ipfs://") ? ipfsToHttp(docUri) : docUri}
            target="_blank"
            rel="noopener noreferrer"
            className="panel flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background/40 group"
          >
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                {t("View document")}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                {t("Timestamped copy on IPFS")}
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </a>
        </div>
      )}
      {embeds.map(({ platform, meta, value }) => {
        const src = getEmbedSrc(platform, value);
        if (src) {
          return (
            <div key={platform} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {t(meta.label)}
              </p>
              {COMPACT[platform] ? (
                <iframe
                  src={src}
                  className="w-full rounded-xl border-0"
                  height={166}
                  allow="autoplay"
                  loading="lazy"
                  title={t(meta.label)}
                />
              ) : (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/20">
                  <iframe
                    src={src}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={t(meta.label)}
                  />
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={platform}>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t(meta.label)}
            </p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("Open link")}
            </a>
          </div>
        );
      })}

      {socials.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("Links")}
          </p>
          <div className="flex flex-wrap gap-2">
            {socials.map(({ platform, meta, value }) => {
              const SIcon = meta.icon;
              return (
                <a
                  key={platform}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground", PANEL_INSET)}
                >
                  <SIcon className="h-3.5 w-3.5" />
                  {t(meta.label)}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
