"use client";

import { useState, type ElementType, type ReactNode } from "react";
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

const THUMB = "w-32 sm:w-44 lg:w-56 aspect-square shrink-0 rounded-2xl overflow-hidden bg-muted";

export function MediaHeader({ image, imageAlt, fallbackIcon: FallbackIcon, loading = false, children }: MediaHeaderProps) {
  const [imgError, setImgError] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 items-start lg:max-w-5xl lg:mx-auto">
        <Skeleton className={THUMB} />
        <div className="flex-1 w-full space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 items-start lg:max-w-5xl lg:mx-auto">
      <PageBackdrop image={image} />

      <div className={THUMB}>
        {image && !imgError ? (
          <img src={image} alt={imageAlt} onError={() => setImgError(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <FallbackIcon className="h-1/3 w-1/3 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-5 min-w-0 w-full">{children}</div>
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
