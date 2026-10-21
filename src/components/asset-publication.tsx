"use client";

import Link from "./link.js";
import { Globe } from "lucide-react";
import { IpTypeBadge } from "./ip-type-badge.js";

export interface AssetPublicationProps {
  name: string;
  ipType: string;
  text: string;
  image: string | null;
  imgError: boolean;
  onImageError: () => void;
  onZoom: () => void;
  publisherName: string;
  publisherImage?: string | null;
  publisherHref: string;
  author?: string | null;
  publishedAt?: number | null;
  websiteUrl?: string | null;
}

function webAddress(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? { href: parsed.href, host: parsed.host.replace(/^www\./, "") } : null;
  } catch {
    return null;
  }
}

export function AssetPublication({
  name,
  ipType,
  text,
  image,
  imgError,
  onImageError,
  onZoom,
  publisherName,
  publisherImage,
  publisherHref,
  author,
  publishedAt,
  websiteUrl,
}: AssetPublicationProps) {
  const website = webAddress(websiteUrl);
  const date = publishedAt ? new Date(publishedAt * 1000).toLocaleDateString(undefined, { dateStyle: "long" }) : null;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const [lead, ...body] = paragraphs.length > 1 ? paragraphs : [null, ...paragraphs];

  return (
    <article className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/50 pb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <IpTypeBadge ipType={ipType} size="sm" />
          <Link href={publisherHref} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
            {publisherImage ? <img src={publisherImage} alt="" className="h-5 w-5 rounded-full object-cover" /> : null}
            {publisherName}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {date ? <time>{date}</time> : null}
          {website ? (
            <a href={website.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              <Globe className="h-3.5 w-3.5" />
              {website.host}
            </a>
          ) : null}
        </div>
      </div>

      <header className="space-y-3">
        <h1 className="text-2xl lg:text-4xl font-bold leading-tight break-words">{name}</h1>
        {author ? <p className="text-sm text-muted-foreground">{author}</p> : null}
      </header>

      {lead ? <p className="max-w-2xl text-base leading-relaxed text-foreground whitespace-pre-line">{lead}</p> : null}

      {image && !imgError ? (
        <button type="button" onClick={onZoom} aria-label="View full image" className="block w-full overflow-hidden rounded-2xl cursor-zoom-in focus:outline-none">
          <img src={image} alt={name} onError={onImageError} className="w-full aspect-[21/9] object-cover" />
        </button>
      ) : null}

      <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-foreground/85 break-words">
        {body.map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
