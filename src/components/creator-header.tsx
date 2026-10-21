"use client";

import type { ReactNode } from "react";
import { Globe, MessageCircle, Send, Twitter, UserRound } from "lucide-react";
import type { ApiCreatorProfile } from "@medialane/sdk";
import { AssetHeaderBlock } from "./asset-top-sections.js";
import { MediaHeader, HeaderStats, HeaderStat } from "./media-header.js";
import { CreatorScoreInline } from "./creator-score-inline.js";
import { profileIdentity } from "../utils/profile-identity.js";

export interface CreatorHeaderStat {
  label: string;
  value: number | null;
}

export interface CreatorHeaderProps {
  creator: ApiCreatorProfile | null | undefined;
  image: string | null;
  stats: CreatorHeaderStat[];
  loading?: boolean;
  children?: ReactNode;
}

const SOCIALS = [
  { key: "websiteUrl", label: "Website", icon: Globe },
  { key: "twitterUrl", label: "X", icon: Twitter },
  { key: "discordUrl", label: "Discord", icon: MessageCircle },
  { key: "telegramUrl", label: "Telegram", icon: Send },
] as const;

export function CreatorHeader({ creator, image, stats, loading = false, children }: CreatorHeaderProps) {
  const { identity, name } = profileIdentity({
    username: creator?.username,
    name: creator?.name,
    walletAddress: creator?.walletAddress,
  });
  const socials = creator ? SOCIALS.filter((s) => creator[s.key]) : [];

  return (
    <MediaHeader image={image} imageAlt={name ?? identity} fallbackIcon={UserRound} loading={loading || !creator}>
      {creator ? (
        <>
          <AssetHeaderBlock
            name={name ?? identity}
            description={creator.bio}
            badges={<CreatorScoreInline address={creator.walletAddress} size="sm" />}
          />

          {name ? <p className="text-sm tabular-nums text-muted-foreground">{identity}</p> : null}

          <HeaderStats>
            {stats.map((s) => (s.value != null ? <HeaderStat key={s.label} label={s.label}>{s.value.toLocaleString()}</HeaderStat> : null))}
          </HeaderStats>

          {socials.length > 0 ? (
            <div className="flex items-center gap-3">
              {socials.map(({ key, label, icon: Icon }) => (
                <a
                  key={key}
                  href={creator[key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}

          {children}
        </>
      ) : null}
    </MediaHeader>
  );
}
