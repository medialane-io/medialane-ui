"use client";

import { useState } from "react";
import Image from "next/image";
import { useIntersectionActive } from "../utils/use-intersection-active.js";

export interface AnimatedTokenMediaProps {

  image: string | null;
  alt: string;

  animationUrl?: string | null;

  live?: boolean;

  mode?: "fill" | "natural";
  className?: string;
  sizes?: string;
  priority?: boolean;

  imgError?: boolean;
  onImageError?: () => void;

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
