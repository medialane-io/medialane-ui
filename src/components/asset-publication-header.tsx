"use client";

import Link from "./link.js";
import { Globe } from "lucide-react";
import { IpTypeBadge } from "./ip-type-badge.js";

export interface AssetPublicationHeaderProps {
  name: string;
  ipType: string;
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

export function AssetPublicationHeader({
  name,
  ipType,
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
}: AssetPublicationHeaderProps) {
  const website = webAddress(websiteUrl);
  const date = publishedAt ? new Date(publishedAt * 1000).toLocaleDateString(undefined, { dateStyle: "long" }) : null;
  return (
    <header className="space-y-6">
      <div className="space-y-4">
        <IpTypeBadge ipType={ipType} size="md" />
        <h1 className="text-2xl lg:text-4xl font-bold break-words">{name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <Link href={publisherHref} className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors">
            {publisherImage ? <img src={publisherImage} alt="" className="h-7 w-7 rounded-full object-cover" /> : null}
            {publisherName}
          </Link>
          {author ? <span>{author}</span> : null}
          {date ? <span>{date}</span> : null}
          {website ? (
            <a href={website.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              <Globe className="h-3.5 w-3.5" />
              {website.host}
            </a>
          ) : null}
        </div>
      </div>
      {image && !imgError ? (
        <button type="button" onClick={onZoom} aria-label="View full image" className="block w-full overflow-hidden rounded-2xl cursor-zoom-in focus:outline-none">
          <img src={image} alt={name} onError={onImageError} className="w-full h-auto max-h-56 object-cover" />
        </button>
      ) : null}
    </header>
  );
}

export function AssetPublicationText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-foreground/90 break-words">
      {text.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i} className="my-4 whitespace-pre-line">{paragraph}</p>
      ))}
    </div>
  );
}
