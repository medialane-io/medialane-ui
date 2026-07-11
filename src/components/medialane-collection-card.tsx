"use client";

import { useRef } from "react";
import { cn } from "../utils/cn.js";

export interface MedialaneCollectionCardProps {
  /** Resolved, browser-loadable image URL. Empty → branded monogram placeholder. */
  image?: string | null;
  /** Asset or collection name. */
  name?: string;
  /** Secondary line under the name (collection name, symbol, ticker…). */
  collection?: string;
  /** Edition or serial shown right-aligned, e.g. "#42" or "1 / 300". */
  serial?: string;
  /** Creator display name or shortened address. */
  creator?: string;
  className?: string;
}

const FRAME_GRADIENT =
  "linear-gradient(135deg, #3b7bff, #8a5cf6 38%, #f6608f 70%, #fb8b46)";

/** The Medialane Collection Card — a branded collectors-card preview of an
 *  asset or collection. A self-contained dark collectible object (identical in
 *  both themes): brand-spectrum frame, pointer-tracked 3D tilt + holographic
 *  sheen, display-face name, tabular serial, Medialane maker's mark. Fluid
 *  width — size it with the parent container. Pure presentation. */
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
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const handleLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const displayName = name?.trim() || "Untitled";
  const monogram = displayName[0]?.toUpperCase() ?? "M";

  return (
    <div className={cn("group", className)} style={{ perspective: "1000px" }}>
      <div
        ref={frameRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="rounded-[24px] p-[1.5px] transition-transform duration-200 ease-out will-change-transform"
        style={{
          background: FRAME_GRADIENT,
          transform:
            "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative rounded-[22.5px] overflow-hidden bg-[#0a0e1f] text-white">
          {/* Artwork */}
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ background: FRAME_GRADIENT, opacity: 0.9 }}
              >
                <span
                  className="text-7xl font-black text-white/90"
                  style={{ fontFamily: "var(--font-display, inherit)" }}
                >
                  {monogram}
                </span>
              </div>
            )}
          </div>

          {/* Holographic sheen — follows the pointer, brand spectrum tint */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 35%), rgba(255,255,255,0.22), transparent 45%),
                linear-gradient(115deg, rgba(59,123,255,0.16), rgba(138,92,246,0.16) 35%, rgba(246,96,143,0.16) 65%, rgba(251,139,70,0.16))`,
              mixBlendMode: "screen",
            }}
          />

          {/* Meta */}
          <div className="relative p-4 pt-3.5">
            <p
              className="text-[17px] font-bold leading-snug truncate"
              style={{ fontFamily: "var(--font-display, inherit)" }}
            >
              {displayName}
            </p>
            {(collection || serial) && (
              <div className="mt-0.5 flex items-baseline gap-2">
                {collection && (
                  <p className="text-[12.5px] text-white/60 truncate">{collection}</p>
                )}
                {serial && (
                  <p className="ml-auto shrink-0 text-[12.5px] text-white/80 tabular-nums">
                    {serial}
                  </p>
                )}
              </div>
            )}
            <div className="my-3 h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full shrink-0"
                style={{ background: FRAME_GRADIENT }}
              />
              <span className="text-[9px] font-bold tracking-[0.18em] text-white/50">
                MEDIALANE
              </span>
              {creator && (
                <span className="ml-auto min-w-0 truncate text-[11px] text-white/60">
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
