"use client";

/**
 * Launchpad grouped services — the single source for the /launchpad page UI
 * in medialane-io and medialane-dapp.
 *
 * Card philosophy (creator-first redesign, 2026-06-10): the whole card is the
 * action. One title, one creator-language sentence (def.blurb), one unique hue
 * per service — no buttons repeating the title, no status badges, no tech
 * chips, no hover-only effects (mobile first: press states only).
 *
 * Apps own: hrefs + per-app rollout status flips. Everything else lives here.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import {
  LAUNCHPAD_SERVICE_DEFINITIONS,
  LAUNCHPAD_SERVICE_GROUPS,
  type ServiceDefinition,
  type ServiceGroupDefinition,
  type ServiceStatus,
} from "../data/launchpad-services.js";

// ── Per-app injection points ─────────────────────────────────────────────────

export interface ServiceOverride {
  /** Primary destination — the whole card links here (required for live services) */
  href?: string;
  /** Secondary browse link href (pairs with the def's browseLinkLabel) */
  browseHref?: string;
  /** Per-app rollout flips (e.g. coins live on one app first) */
  status?: ServiceStatus;
  /** Per-app one-liner override (rarely needed) */
  blurb?: string;
}

export type ServiceOverrides = Record<string, ServiceOverride>;

// ── One unique hue per service — never repeated inside a group ───────────────

interface ServiceHue {
  /** icon + arrow tint (600 for light surfaces, 400 for dark) */
  text: string;
  /** soft circle behind the arrow */
  bg: string;
}

const DEFAULT_HUE: ServiceHue = { text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" };

export const SERVICE_HUES: Record<string, ServiceHue> = {
  "mint-ip-asset": { text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
  "create-collection": { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  "ip-collection-1155": { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  "mint-editions": { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  "creator-coins": { text: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10" },
  "claim-memecoin": { text: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  "collection-drop": { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  "pop-protocol": { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  "remix-asset": { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
  "claim-username": { text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  "claim-collection": { text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
};

// ── Service card — the whole card is the action ─────────────────────────────

export interface LaunchpadServiceCardProps {
  def: ServiceDefinition;
  override?: ServiceOverride;
}

export function LaunchpadServiceCard({ def, override = {} }: LaunchpadServiceCardProps) {
  const { key, icon: Icon, title, browseLinkLabel } = def;
  const status = override.status ?? def.status;
  const blurb = override.blurb ?? def.blurb;
  const { href, browseHref } = override;

  const live = status === "live";
  const hue = SERVICE_HUES[key] ?? DEFAULT_HUE;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card p-5 sm:p-6",
        "flex flex-col gap-3 transition-transform",
        live ? "active:scale-[0.99]" : "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon className={cn("h-7 w-7 shrink-0", live ? hue.text : "text-muted-foreground/50")} />
        {live ? (
          <span className={cn("h-9 w-9 shrink-0 rounded-full flex items-center justify-center", hue.bg)}>
            <ArrowUpRight className={cn("h-4 w-4", hue.text)} />
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60 pt-1">
            <Lock className="h-3 w-3" />
            Coming soon
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight leading-snug">{title}</h3>
        <p className={cn("text-sm leading-relaxed", live ? "text-muted-foreground" : "text-muted-foreground/60")}>
          {blurb}
        </p>
      </div>

      {/* Stretched link — makes the whole card the action without nesting anchors */}
      {live && href && <Link href={href} aria-label={title} className="absolute inset-0 z-10 rounded-2xl" />}

      {live && browseHref && browseLinkLabel && (
        <Link
          href={browseHref}
          className="relative z-20 mt-auto self-start inline-flex items-center gap-1 text-xs font-medium text-muted-foreground active:text-foreground"
        >
          {browseLinkLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// ── Group sections ───────────────────────────────────────────────────────────

function GroupHeader({ group }: { group: ServiceGroupDefinition }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
      <p className="text-sm text-muted-foreground">{group.tagline}</p>
    </div>
  );
}

function ComingSoonStrip({ group, defs }: { group: ServiceGroupDefinition; defs: ServiceDefinition[] }) {
  return (
    <div className="rounded-2xl border border-border/40 p-5">
      <p className="font-semibold text-sm">{group.title}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{group.tagline}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {defs.map(({ key, icon: Icon, title }) => (
          <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/30 border border-border/25">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface LaunchpadGroupedSectionsProps {
  /** Per-app hrefs / rollout flips, keyed by service key. */
  overrides: ServiceOverrides;
  className?: string;
}

/** The full grouped launchpad services block — section order comes from
 *  LAUNCHPAD_SERVICE_GROUPS; cards from LAUNCHPAD_SERVICE_DEFINITIONS. */
export function LaunchpadGroupedSections({ overrides, className }: LaunchpadGroupedSectionsProps) {
  return (
    <div className={cn("space-y-10", className)}>
      {LAUNCHPAD_SERVICE_GROUPS.map((group) => {
        const defs = LAUNCHPAD_SERVICE_DEFINITIONS.filter((d) => d.group === group.key);
        if (defs.length === 0) return null;
        if (group.key === "coming-soon") {
          return <ComingSoonStrip key={group.key} group={group} defs={defs} />;
        }
        return (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-4"
          >
            <GroupHeader group={group} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {defs.map((def) => (
                <LaunchpadServiceCard key={def.key} def={def} override={overrides[def.key]} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
