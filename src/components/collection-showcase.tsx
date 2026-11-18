"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ApiCollection } from "@medialane/sdk";
import Link from "./link.js";
import Image from "./image.js";
import { Skeleton } from "./skeleton.js";
import { cn } from "../utils/cn.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useT } from "../i18n/provider.js";

export interface CollectionShowcaseProps {
  collections: ApiCollection[];
  isLoading: boolean;
  getHref: (collection: ApiCollection) => string;
}

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;
const CARD_SIZE = "aspect-[4/5] w-[58vw] max-w-[260px] sm:max-w-[300px] lg:max-w-[min(440px,60vh)] xl:max-w-[min(500px,62vh)]";

function offsetFrom(index: number, current: number, count: number) {
  const distance = (index - current + count) % count;
  return distance > count / 2 ? distance - count : distance;
}

function ShowcaseSkeleton() {
  return (
    <section className="px-4 pb-8 pt-20 sm:pt-14">
      <Skeleton className={cn("mx-auto rounded-2xl", CARD_SIZE)} />
      <Skeleton className="mx-auto mt-6 h-9 w-56" />
    </section>
  );
}

export function CollectionShowcase({ collections, isLoading, getHref }: CollectionShowcaseProps) {
  const t = useT();
  const resolveImage = useImageUrl();
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const dragged = useRef(false);
  const count = collections.length;

  const go = (step: number) => setCurrent((index) => (index + step + count) % count);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || hidden || reduceMotion) return;
    const id = setInterval(() => setCurrent((index) => (index + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused, hidden, reduceMotion]);

  if (isLoading) return <ShowcaseSkeleton />;
  if (count === 0) return null;

  const active = collections[current % count]!;
  const transition = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 26 };

  return (
    <section
      className="relative overflow-hidden px-4 pb-8 pt-20 sm:pt-14"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {collections.map((collection, index) => {
        const haloImage = resolveImage(collection.image, { width: 960 });
        if (!haloImage) return null;
        return (
          <motion.div
            key={collection.contractAddress}
            aria-hidden
            className="pointer-events-none absolute inset-0 scale-125 blur-3xl"
            initial={false}
            animate={{ opacity: index === current ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.8 }}
          >
            <Image src={haloImage} alt="" fill className="object-cover" unoptimized />
          </motion.div>
        );
      })}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />

      <motion.div
        role="group"
        aria-roledescription="carousel"
        aria-label={t("Featured collections")}
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={(event) => {
          if (count <= 1) return;
          if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
          else if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
        }}
        className={cn("relative mx-auto touch-pan-y rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background", CARD_SIZE)}
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => { dragged.current = true; }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE_PX) go(1);
          else if (info.offset.x > SWIPE_PX) go(-1);
          setTimeout(() => { dragged.current = false; }, 0);
        }}
      >
        {collections.map((collection, index) => {
          const offset = offsetFrom(index, current, count);
          const distance = Math.abs(offset);
          const image = resolveImage(collection.image, { width: 640 });
          const name = collection.name ?? "Collection";
          return (
            <motion.div
              key={collection.contractAddress}
              className={cn("absolute inset-0", distance > 2 && "pointer-events-none")}
              initial={false}
              animate={{
                x: `${offset * 58}%`,
                rotate: offset * 9,
                scale: 1 - distance * 0.12,
                opacity: distance > 2 ? 0 : 1,
                zIndex: 10 - distance,
              }}
              transition={transition}
            >
              <Link
                href={getHref(collection)}
                aria-label={name}
                draggable={false}
                onClick={(event) => { if (dragged.current) event.preventDefault(); }}
                className="relative block h-full w-full overflow-hidden rounded-2xl bg-muted shadow-2xl shadow-black/20 dark:shadow-black/50"
              >
                {image ? (
                  <Image src={image} alt="" fill sizes="(min-width: 1024px) 340px, 58vw" className="object-cover" priority={index === 0} unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/40 via-brand-blue/20 to-brand-navy/60" />
                )}
                <span className={cn("absolute inset-0 bg-black/30 transition-opacity duration-500", offset === 0 ? "opacity-0" : "opacity-100")} />
                <span className="absolute inset-x-3 bottom-3 flex flex-col items-start gap-1.5">
                  <span className="max-w-full truncate rounded-full bg-black/30 px-4 py-1.5 text-base font-semibold leading-tight text-white backdrop-blur-md sm:text-lg">
                    {name}
                  </span>
                  {collection.totalSupply != null && (
                    <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-md">
                      {collection.totalSupply.toLocaleString()} {collection.totalSupply === 1 ? t("item") : t("items")}
                    </span>
                  )}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <h2 aria-live={paused ? "polite" : "off"} className="sr-only">
        {active.name ?? t("Collection")}
      </h2>

      {count > 1 && (
        <div className="relative mt-4 flex justify-center">
          {collections.map((collection, index) => (
            <button
              key={collection.contractAddress}
              type="button"
              aria-label={`Show ${collection.name ?? "collection"}`}
              aria-current={index === current ? "true" : undefined}
              onClick={() => setCurrent(index)}
              className="flex h-8 items-center px-0.5"
            >
              <span className={cn("h-1.5 rounded-full transition-all", index === current ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30")} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
