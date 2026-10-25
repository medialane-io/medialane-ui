"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "./button.js";
import { externalLink } from "../utils/external-link.js";

export interface AssetPublicationProps {
  name: string;
  text: string;
  image: string | null;
  imgError: boolean;
  onImageError: () => void;
  onZoom: () => void;
  author?: string | null;
  externalUrl?: string | null;
}

export function AssetPublication({ name, text, image, imgError, onImageError, onZoom, author, externalUrl }: AssetPublicationProps) {
  const link = externalLink(externalUrl);
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const [lead, ...body] = paragraphs.length > 1 ? paragraphs : [null, ...paragraphs];

  return (
    <article className="min-w-0 space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl lg:text-4xl font-bold leading-tight break-words">{name}</h1>
      </header>

      {lead ? <p className="max-w-3xl text-base leading-relaxed text-foreground whitespace-pre-line">{lead}</p> : null}

      {image && !imgError ? (
        <button type="button" onClick={onZoom} aria-label="View full image" className="block w-full overflow-hidden rounded-3xl cursor-zoom-in focus:outline-none">
          <img src={image} alt={name} onError={onImageError} className="w-full h-auto max-h-[80vh] object-contain" />
        </button>
      ) : null}

      <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-foreground/85 break-words">
        {body.map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">{paragraph}</p>
        ))}
      </div>

      {author || link ? (
        <div className="flex flex-wrap items-center gap-4">
          {author ? <p className="min-w-0 break-words text-sm text-muted-foreground">{author}</p> : null}
          {link ? (
            <Button asChild variant="outline">
              <a href={link} target="_blank" rel="noopener noreferrer">
                Read more
                <ExternalLink />
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
