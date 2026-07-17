"use client";

import { useRef } from "react";
import { cn } from "../utils/cn.js";

export interface MedialaneCollectionCardProps {
  /** Resolved, browser-loadable image URL. Empty → brand-gradient placeholder. */
  image?: string | null;
  /** Asset or collection name. */
  name?: string;
  /** Secondary line under the name (collection name, symbol, ticker…). */
  collection?: string;
  /** Edition or serial shown as a pill, e.g. "#42" or "1 / 300". */
  serial?: string;
  /** Creator display name or shortened address. */
  creator?: string;
  className?: string;
}

const FRAME_GRADIENT =
  "linear-gradient(135deg, #3b7bff, #8a5cf6 38%, #f6608f 70%, #fb8b46)";

/** The Medialane Collection Card — a branded collectors-card preview of an
 *  asset or collection. A self-contained collectible object: brand-spectrum
 *  frame, inset artwork on foil-tinted material, pointer-tracked 3D tilt +
 *  holographic sheen, display-face name, serial pill, Medialane maker's mark.
 *  Follows the app's light/dark theme automatically (`.ml-card-material` /
 *  `.ml-card-sheen` in medialane.css carry the `.dark` overrides — light is
 *  the default, no `.dark` ancestor needed). Fluid width — size it with the
 *  parent container. Pure presentation. */
export function MedialaneCollectionCard({
  image,
  name,
  collection,
  serial,
  creator,
  className,
}: MedialaneCollectionCardProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 9}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--pop", "1.015");
  };

  const handleLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--pop", "1");
  };

  const displayName = name?.trim() || "Untitled";

  return (
    <div className={cn("group", className)} style={{ perspective: "1000px" }}>
      <div
        ref={frameRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="rounded-[24px] p-[1.5px] transition-transform duration-200 ease-out will-change-transform shadow-[0_16px_40px_-16px_rgba(91,76,230,0.45)]"
        style={{
          background: FRAME_GRADIENT,
          transform:
            "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--pop, 1))",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="ml-card-material relative rounded-[22.5px] overflow-hidden text-[#0a0e1f] dark:text-white ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.06]"
        >
          {/* Artwork — inset like a printed trading card */}
          <div className="p-2.5 pb-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] ring-1 ring-black/10 dark:ring-white/10">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ background: FRAME_GRADIENT, opacity: 0.9 }}
                />
              )}
              {/* Bottom scrim for depth against the meta block */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                style={{ background: "linear-gradient(to top, rgba(10,14,31,0.45), transparent)" }}
              />
            </div>
          </div>

          {/* Holographic sheen — visible at rest, blooms and tracks on hover */}
          <div
            aria-hidden
            className="ml-card-sheen pointer-events-none absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Meta */}
          <div className="relative px-4 pt-3 pb-4">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-[18px] font-bold leading-snug truncate">
                {displayName}
              </p>
              {serial && (
                <span className="mt-0.5 shrink-0 rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#0a0e1f]/80 dark:text-white/80 tabular-nums">
                  {serial}
                </span>
              )}
            </div>
            {collection && (
              <p className="mt-0.5 text-[12.5px] text-[#0a0e1f]/55 dark:text-white/55 truncate">{collection}</p>
            )}
            <div className="my-3 h-px bg-black/10 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full shrink-0"
                style={{ background: FRAME_GRADIENT }}
              />
              <span className="text-[9px] font-bold tracking-[0.18em] text-[#0a0e1f]/50 dark:text-white/50">
                MEDIALANE
              </span>
              {creator && (
                <span className="ml-auto min-w-0 truncate text-[11px] text-[#0a0e1f]/55 dark:text-white/55 tabular-nums">
                  {creator}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
