"use client";

import { useState, type ElementType, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { AssetMediaColumn } from "./asset-top-sections.js";
import { Skeleton } from "./skeleton.js";

export interface MediaHeaderProps {
  image: string | null;
  imageAlt: string;
  fallbackIcon: ElementType;
  loading?: boolean;
  children: ReactNode;
}

export function PageBackdrop({ image }: { image: string | null }) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <img
        src={image}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110"
        style={{ filter: "blur(60px) saturate(1.5)" }}
      />
    </div>
  );
}

export function MediaHeader({ image, imageAlt, fallbackIcon: FallbackIcon, loading = false, children }: MediaHeaderProps) {
  const shouldReduce = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
      <PageBackdrop image={image} />

      <AssetMediaColumn
        shouldReduce={Boolean(shouldReduce)}
        image={image}
        imageAlt={imageAlt}
        imgError={imgError}
        onImageError={() => setImgError(true)}
        fallback={(
          <div className="aspect-square flex items-center justify-center bg-muted">
            <FallbackIcon className="h-24 w-24 text-muted-foreground/40" />
          </div>
        )}
      />

      <div className="space-y-5 min-w-0">{children}</div>
    </div>
  );
}

export function HeaderStats({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">{children}</div>;
}

export function HeaderStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{children}</span>
    </span>
  );
}
