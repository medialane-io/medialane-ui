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
  /** icon + link tint (600 for light surfaces, 400 for dark) */
  text: string;
  /** solid fill — the arrow action + icon glow */
  solid: string;
  /** gradient ring around live cards */
  ring: string;
}

const DEFAULT_HUE: ServiceHue = {
  text: "text-sky-600 dark:text-sky-400",
  solid: "bg-sky-500",
  ring: "from-sky-500/60 via-sky-400/15 to-sky-600/40",
};

export const SERVICE_HUES: Record<string, ServiceHue> = {
  "mint-ip-asset": { text: "text-sky-600 dark:text-sky-400", solid: "bg-sky-500", ring: "from-sky-500/60 via-sky-400/15 to-sky-600/40" },
  "create-collection": { text: "text-violet-600 dark:text-violet-400", solid: "bg-violet-500", ring: "from-violet-500/60 via-violet-400/15 to-violet-600/40" },
  "ip-collection-1155": { text: "text-rose-600 dark:text-rose-400", solid: "bg-rose-500", ring: "from-rose-500/60 via-rose-400/15 to-rose-600/40" },
  "mint-editions": { text: "text-amber-600 dark:text-amber-400", solid: "bg-amber-500", ring: "from-amber-500/60 via-amber-400/15 to-amber-600/40" },
  "creator-coins": { text: "text-pink-600 dark:text-pink-400", solid: "bg-pink-500", ring: "from-pink-500/60 via-pink-400/15 to-pink-600/40" },
  "claim-memecoin": { text: "text-teal-600 dark:text-teal-400", solid: "bg-teal-500", ring: "from-teal-500/60 via-teal-400/15 to-teal-600/40" },
  "collection-drop": { text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-500", ring: "from-orange-500/60 via-orange-400/15 to-orange-600/40" },
  "pop-protocol": { text: "text-emerald-600 dark:text-emerald-400", solid: "bg-emerald-500", ring: "from-emerald-500/60 via-emerald-400/15 to-emerald-600/40" },
  "remix-asset": { text: "text-indigo-600 dark:text-indigo-400", solid: "bg-indigo-500", ring: "from-indigo-500/60 via-indigo-400/15 to-indigo-600/40" },
  "claim-username": { text: "text-purple-600 dark:text-purple-400", solid: "bg-purple-500", ring: "from-purple-500/60 via-purple-400/15 to-purple-600/40" },
  "claim-collection": { text: "text-cyan-600 dark:text-cyan-400", solid: "bg-cyan-500", ring: "from-cyan-500/60 via-cyan-400/15 to-cyan-600/40" },
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

  const card = (
    <div
      className={cn(
        "relative rounded-[15px] bg-card overflow-hidden flex flex-col flex-1 min-h-[210px]",
        "transition-transform",
        live ? "active:scale-[0.99]" : "opacity-70",
      )}
    >
      {/* Soft hue tint — same language as the Drop Pages panel */}
      {live && (
        <div aria-hidden className={cn("absolute inset-0 pointer-events-none bg-gradient-to-br to-transparent opacity-[0.07]", hue.solid.replace("bg-", "from-"))} />
      )}
      {/* Giant watermark icon, ghosted in the corner */}
      <div aria-hidden className="absolute -right-8 -bottom-10 opacity-[0.05] select-none pointer-events-none">
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
          <p className={cn("text-[15px] leading-relaxed max-w-[34ch]", live ? "text-muted-foreground" : "text-muted-foreground/60")}>
            {blurb}
          </p>
        </div>

        {/* Stretched link — the whole card is the action, no title-repeating button */}
        {live && href && <Link href={href} aria-label={title} className="absolute inset-0 z-10" />}

        <div className="mt-auto pt-1 flex items-end justify-between">
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
            <span className={cn("h-11 w-11 shrink-0 rounded-full flex items-center justify-center shadow-lg shadow-black/20", hue.solid)}>
              <ArrowUpRight className="h-5 w-5 text-white" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return live ? (
    <div className={cn("p-[1px] rounded-2xl bg-gradient-to-br flex flex-col", hue.ring)}>
      {card}
    </div>
  ) : (
    <div className="rounded-2xl border border-border/30 flex flex-col">{card}</div>
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
