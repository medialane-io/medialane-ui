"use client";

import type { ReactNode } from "react";
import { Check, ImageIcon } from "lucide-react";
import Link from "./link.js";
import Image from "./image.js";
import { Button } from "./button.js";

export interface CollectionCreatedProps {
  name: string;
  image?: string | null;
  caption?: string;
  viewHref?: string;
  mintHref?: string;
  mintLabel?: string;
  onCreateAnother: () => void;
  createAnotherLabel?: string;
  children?: ReactNode;
}

export function CollectionCreated({
  name,
  image,
  caption = "Your collection is live",
  viewHref,
  mintHref,
  mintLabel = "Mint an asset",
  onCreateAnother,
  createAnotherLabel = "Create another",
  children,
}: CollectionCreatedProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6 py-2 text-center">
      <div className="relative">
        <div className="relative h-40 w-40 overflow-hidden rounded-3xl border border-border bg-muted shadow-lg">
          {image ? (
            <Image src={image} alt={name} fill sizes="160px" unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>
        <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-background">
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
      </div>

      <div className="max-w-full space-y-1">
        <p className="truncate text-xl font-bold">{name || "Your collection"}</p>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </div>

      <div className="flex w-full flex-col gap-2">
        {(mintHref || viewHref) && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {mintHref && (
              <Button asChild className="flex-1">
                <Link href={mintHref}>{mintLabel}</Link>
              </Button>
            )}
            {viewHref && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={viewHref}>View collection</Link>
              </Button>
            )}
          </div>
        )}
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onCreateAnother}>
          {createAnotherLabel}
        </Button>
      </div>

      {children}
    </div>
  );
}
