"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useIntersectionActive } from "../utils/use-intersection-active.js";
import { cn } from "../utils/cn.js";

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

  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [image]);

  const [ref, isVisible] = useIntersectionActive<HTMLDivElement>();
  const showLive = live && !!animationUrl && isVisible;

  return (
    <div ref={ref} className={mode === "fill" ? "absolute inset-0" : "relative w-full"}>
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
        <>
          {!loaded && (
            <div
              className={cn(
                "animate-[shimmer_1.6s_ease-in-out_infinite] bg-foreground/[0.06] absolute",
                mode === "fill" ? "inset-0" : "inset-x-0 top-0 aspect-square"
              )}
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, color-mix(in srgb, var(--foreground) 8%, transparent), transparent)",
                backgroundSize: "200% 100%",
              }}
            />
          )}
          {mode === "fill" ? (
            <Image
              src={image}
              alt={alt}
              fill
              unoptimized
              sizes={sizes}
              priority={priority}
              className={cn(className, "transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
              onLoad={() => setLoaded(true)}
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
              className={cn(className ?? "w-full h-auto", "transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
              onLoad={() => setLoaded(true)}
              onError={handleImageError}
            />
          )}
        </>
      ) : (
        fallback ?? null
      )}
    </div>
  );
}
