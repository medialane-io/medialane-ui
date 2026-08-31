"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "../utils/cn.js";
import { CurrencyIcon } from "./currency-icon.js";
import { Skeleton } from "./skeleton.js";

export interface CollectionHeroStat {
  label: string;
  display: string;

  symbol?: string | null;
}

export interface CollectionHeroBannerProps {
  bannerUrl: string | null;
  loading?: boolean;
  standard?: string | null;
  symbol?: string | null;
  name: string;
  stats: CollectionHeroStat[];
  className?: string;

  /** Extra content rendered alongside the standard/symbol eyebrow pills —
   *  e.g. a creator level badge on a creator profile reusing this banner. */
  eyebrowSlot?: React.ReactNode;
}

export function CollectionHeroBanner({
  bannerUrl,
  loading = false,
  standard,
  symbol,
  name,
  stats,
  className,
  eyebrowSlot,
}: CollectionHeroBannerProps) {
  const { scrollY } = useScroll();
  const shouldReduce = useReducedMotion();
  const y = useTransform(scrollY, [0, 500], [0, shouldReduce ? 0 : 150]);

  return (
    <>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110"
            style={{ filter: "blur(60px) saturate(1.5)" }}
          />
        )}
      </div>

      {loading ? (
        <Skeleton className={cn("w-full h-[50svh]", className)} />
      ) : (
        <div className={cn("relative w-full overflow-hidden h-[50svh]", className)}>
          {bannerUrl ? (
            <motion.img
              src={bannerUrl}
              alt=""
              aria-hidden
              style={{ y }}
              className="absolute inset-0 w-full h-full object-cover scale-110"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-muted" />
          )}

          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 z-10">
            {(standard || symbol || eyebrowSlot) && (
              <div className="flex items-center gap-2 flex-wrap">
                {standard === "ERC1155" ? (
                  <Eyebrow>Multi-edition NFT</Eyebrow>
                ) : standard === "ERC721" ? (
                  <Eyebrow>Single NFT</Eyebrow>
                ) : null}
                {symbol && <Eyebrow className="tabular-nums">{symbol}</Eyebrow>}
                {eyebrowSlot}
              </div>
            )}

            <h1
              className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
            >
              {name}
            </h1>

            <div className="flex gap-2 flex-wrap">
              {stats.map(({ label, display, symbol: statSymbol }) => (
                <div
                  key={label}
                  className={cn(
                    "bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 flex flex-col justify-center shrink-0",
                    statSymbol ? "min-w-[80px]" : "min-w-[60px] items-center text-center"
                  )}
                >
                  <p className="text-[9px] text-white/70 mb-1">{label}</p>
                  {statSymbol ? (
                    <div className="flex items-center gap-1.5">
                      <CurrencyIcon symbol={statSymbol} size={15} />
                      <p className="text-sm sm:text-base font-bold text-white tabular-nums leading-tight truncate">
                        {display}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg font-bold text-white tabular-nums leading-tight">{display}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold text-white/90 bg-white/15 backdrop-blur-md rounded-full px-2.5 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
}
