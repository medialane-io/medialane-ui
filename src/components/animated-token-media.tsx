"use client";

import { useState } from "react";
import Image from "next/image";
import { useIntersectionActive } from "../utils/use-intersection-active.js";

export interface AnimatedTokenMediaProps {
  /** Resolved (already ipfsToHttp'd, if needed) static image URL. */
  image: string | null;
  alt: string;
  /** Resolved animation_url (data:/http(s)/ipfs-resolved) — the live on-chain renderer. */
  animationUrl?: string | null;
  /** Caller-computed eligibility — this component never decides eligibility itself. */
  live?: boolean;
  /**
   * "fill" = absolutely-positioned, fills a `position:relative` parent (grid
   * tiles). "natural" = flows at its own width, `w-full h-auto` for the
   * image / a forced square for the live iframe (asset detail hero).
   */
  mode?: "fill" | "natural";
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Controlled error state (AssetMediaColumn's existing external contract). Omit for internal (uncontrolled) tracking. */
  imgError?: boolean;
  onImageError?: () => void;
  /** Rendered instead of the image/iframe when there's no image and nothing live to show, or the image errored. */
  fallback?: React.ReactNode;
}

export function AnimatedTokenMedia({
  image,
  alt,
  animationUrl,
  live = false,
  mode = "fill",
  className,
  sizes,
  priority,
  imgError: imgErrorProp,
  onImageError,
  fallback,
}: AnimatedTokenMediaProps) {
  const [internalError, setInternalError] = useState(false);
  const imgError = imgErrorProp ?? internalError;
  const handleImageError = () => {
    setInternalError(true);
    onImageError?.();
  };

  const [ref, isVisible] = useIntersectionActive<HTMLDivElement>();
  const showLive = live && !!animationUrl && isVisible;

  return (
    <div ref={ref} className={mode === "fill" ? "absolute inset-0" : "w-full"}>
      {showLive ? (
        <iframe
          src={animationUrl!}
          title={alt}
          sandbox="allow-scripts"
          loading="lazy"
          className={
            mode === "fill"
              ? "absolute inset-0 w-full h-full border-0"
              : "w-full aspect-square border-0"
          }
        />
      ) : image && !imgError ? (
        mode === "fill" ? (
          <Image
            src={image}
            alt={alt}
            fill
            unoptimized
            sizes={sizes}
            priority={priority}
            className={className}
            onError={handleImageError}
          />
        ) : (
          <Image
            src={image}
            alt={alt}
            width={0}
            height={0}
            sizes={sizes}
            priority={priority}
            crossOrigin="anonymous"
            className={className ?? "w-full h-auto"}
            onError={handleImageError}
          />
        )
      ) : (
        fallback ?? null
      )}
    </div>
  );
}
