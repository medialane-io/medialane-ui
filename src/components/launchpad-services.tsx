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
import { Lock, ArrowRight } from "lucide-react";
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
  /** icon tint (600 for light surfaces, 400 for dark) */
  text: string;
  /** solid fill — icon glow */
  solid: string;
  /** thin card border tint */
  border: string;
  /** vivid two-stop gradient for the action pill (asset-page button language) */
  pill: string;
}

const DEFAULT_HUE: ServiceHue = {
  text: "text-sky-600 dark:text-sky-400",
  solid: "bg-sky-500",
  border: "border-sky-500/25",
  pill: "bg-gradient-to-r from-sky-500 to-blue-600",
};

export const SERVICE_HUES: Record<string, ServiceHue> = {
  "mint-ip-asset": { text: "text-sky-600 dark:text-sky-400", solid: "bg-sky-500", border: "border-sky-500/25", pill: "bg-gradient-to-r from-sky-500 to-blue-600" },
  "create-collection": { text: "text-violet-600 dark:text-violet-400", solid: "bg-violet-500", border: "border-violet-500/25", pill: "bg-gradient-to-r from-violet-500 to-purple-600" },
  "ip-collection-1155": { text: "text-rose-600 dark:text-rose-400", solid: "bg-rose-500", border: "border-rose-500/25", pill: "bg-gradient-to-r from-rose-500 to-red-600" },
  "mint-editions": { text: "text-amber-600 dark:text-amber-400", solid: "bg-amber-500", border: "border-amber-500/25", pill: "bg-gradient-to-r from-amber-500 to-orange-600" },
  "creator-coins": { text: "text-pink-600 dark:text-pink-400", solid: "bg-pink-500", border: "border-pink-500/25", pill: "bg-gradient-to-r from-pink-500 to-rose-600" },
  "claim-memecoin": { text: "text-teal-600 dark:text-teal-400", solid: "bg-teal-500", border: "border-teal-500/25", pill: "bg-gradient-to-r from-teal-500 to-cyan-600" },
  "collection-drop": { text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-500", border: "border-orange-500/25", pill: "bg-gradient-to-r from-orange-500 to-red-500" },
  "pop-protocol": { text: "text-emerald-600 dark:text-emerald-400", solid: "bg-emerald-500", border: "border-emerald-500/25", pill: "bg-gradient-to-r from-emerald-500 to-green-600" },
  "remix-asset": { text: "text-indigo-600 dark:text-indigo-400", solid: "bg-indigo-500", border: "border-indigo-500/25", pill: "bg-gradient-to-r from-indigo-500 to-blue-600" },
  "claim-username": { text: "text-purple-600 dark:text-purple-400", solid: "bg-purple-500", border: "border-purple-500/25", pill: "bg-gradient-to-r from-purple-500 to-fuchsia-600" },
  "claim-collection": { text: "text-cyan-600 dark:text-cyan-400", solid: "bg-cyan-500", border: "border-cyan-500/25", pill: "bg-gradient-to-r from-cyan-500 to-sky-600" },
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
        "relative rounded-2xl border bg-card overflow-hidden flex flex-col flex-1 min-h-[210px]",
        "transition-transform",
        live ? cn(hue.border, "active:scale-[0.99]") : "border-border/30 opacity-70",
      )}
    >
      {/* Giant watermark icon, ghosted in the corner (Drop-Pages-panel language) */}
      <div aria-hidden className="absolute -right-8 -bottom-10 opacity-[0.04] select-none pointer-events-none">
        <Icon className="h-44 w-44" />
      </div>

      <div className="relative flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            {live && (
              <div aria-hidden className={cn("absolute -inset-3 rounded-full blur-2xl opacity-30", hue.solid)} />
            )}
            <Icon className={cn("relative h-9 w-9 shrink-0", live ? hue.text : "text-muted-foreground/50")} />
          </div>
          {!live && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60 pt-1">
              <Lock className="h-3 w-3" />
              Coming soon
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-2xl font-bold tracking-tight leading-snug">{title}</h3>
          <p className={cn("text-[15px] leading-relaxed max-w-[36ch]", live ? "text-muted-foreground" : "text-muted-foreground/60")}>
            {blurb}
          </p>
        </div>

        {/* Stretched link — the whole card is the action; the pill is the visual cue */}
        {live && href && <Link href={href} aria-label={`${def.cta} — ${title}`} className="absolute inset-0 z-10" />}

        <div className="mt-auto pt-1 flex items-end justify-between gap-3">
          {live && browseHref && browseLinkLabel ? (
            <Link
              href={browseHref}
              className="relative z-20 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground active:text-foreground"
            >
              {browseLinkLabel}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <span />
          )}
          {live && (
            <span
              className={cn(
                "inline-flex items-center gap-2 h-10 px-5 rounded-full",
                "text-sm font-semibold text-white shadow-lg shadow-black/25",
                hue.pill,
              )}
            >
              {def.cta}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
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
