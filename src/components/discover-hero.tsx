"use client";

import { motion } from "framer-motion";
import { KineticWords, EASE_OUT } from "./motion-primitives.js";
import { ActivityTicker } from "./activity-ticker.js";
import type { ApiOrder } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";

export interface DiscoverHeroProps {
  stats: { collections: number; tokens: number; sales: number } | null;
  orders: ApiOrder[];
  badgeText?: string;
  headlineText?: string;
  getTickerHref?: (order: ApiOrder) => string;
}

export function DiscoverHero({
  stats,
  orders,
  badgeText,
  headlineText = "Create, share & explore",
  getTickerHref,
}: DiscoverHeroProps) {
  const intl = useFormat();
  const t = useT();
  return (
    <div className="space-y-6 pt-2">
      {badgeText ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <span className="pill">{badgeText}</span>
        </motion.div>
      ) : null}

      <motion.div
        className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1]"
        style={{ perspective: "800px" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
      >
        <span className="text-primary">
          <KineticWords text={headlineText} />
        </span>
      </motion.div>

      {stats && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35, ease: EASE_OUT }}
        >
          {[
            { label: t("Collections"), value: stats.collections },
            { label: t("Assets"), value: stats.tokens },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm bg-background/40"
            >
              <span className="font-bold tabular-nums">{intl.number(value) ?? "—"}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>
      )}

      <ActivityTicker orders={orders} getHref={getTickerHref} />
    </div>
  );
}
