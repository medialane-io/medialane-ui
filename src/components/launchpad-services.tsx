"use client";

/**
 * Launchpad grouped services — the single source for the /launchpad page UI
 * in medialane-io and medialane-starknet.
 *
 * Card philosophy (creator-first redesign 2026-06-10; flat card pass
 * 2026-07-05): the whole card is the action. One title, one creator-language
 * sentence (def.blurb), one unique hue per service. The hue lives in a soft
 * icon-tile tint and a static border — no ambient aurora glow, no blurred
 * light-leaks, no gradient wash behind the card. Those read as washed-out
 * noise on light backgrounds and don't match the rest of the design system
 * (flat surfaces, solid accents). A staggered entrance reveal and a quiet
 * border/lift microinteraction on hover are still here; hover is desktop
 * polish only (gated to sm+, degraded under reduced-motion).
 *
 * Filter state (search + group pills) lives in `useLaunchpadFilter()` so a
 * page can render `LaunchpadFilterBar` wherever it wants (e.g. right under
 * the h1) while `LaunchpadGroupedSections` — now fully controlled — renders
 * only the grid reacting to that same state.
 *
 * Apps own: hrefs + per-app rollout status flips. Everything else lives here.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lock, ArrowRight, Check } from "lucide-react";
import { cn } from "../utils/cn.js";
import {
  LAUNCHPAD_SERVICE_DEFINITIONS,
  LAUNCHPAD_SERVICE_GROUPS,
  type ServiceDefinition,
  type ServiceGroup,
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
  /** icon glyph tint (600 for light surfaces, 400 for dark) */
  text: string;
  /** solid fill — CTA button background */
  solid: string;
  /** static card border (visible on both themes, not just on hover) */
  border: string;
  /** soft icon-tile background (10% tint, both themes) */
  tint: string;
}

const DEFAULT_HUE: ServiceHue = {
  text: "text-sky-600 dark:text-sky-400",
  solid: "bg-sky-600",
  border: "border-sky-500/30 dark:border-sky-400/25",
  tint: "bg-sky-500/10",
};

export const SERVICE_HUES: Record<string, ServiceHue> = {
  // Single Editions — blue + green
  "mint-ip-asset": { text: "text-blue-600 dark:text-blue-400", solid: "bg-blue-600", border: "border-blue-500/30 dark:border-blue-400/25", tint: "bg-blue-500/10" },
  "create-collection": { text: "text-green-600 dark:text-green-400", solid: "bg-green-600", border: "border-green-500/30 dark:border-green-400/25", tint: "bg-green-500/10" },
  // Limited Editions — purple + red
  "ip-collection-1155": { text: "text-purple-600 dark:text-purple-400", solid: "bg-purple-600", border: "border-purple-500/30 dark:border-purple-400/25", tint: "bg-purple-500/10" },
  "mint-editions": { text: "text-red-600 dark:text-red-400", solid: "bg-red-600", border: "border-red-500/30 dark:border-red-400/25", tint: "bg-red-500/10" },
  // Creator Coins & Memecoins — yellow + orange
  "creator-coins": { text: "text-yellow-600 dark:text-yellow-400", solid: "bg-yellow-600", border: "border-yellow-500/30 dark:border-yellow-400/25", tint: "bg-yellow-500/10" },
  "claim-memecoin": { text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-600", border: "border-orange-500/30 dark:border-orange-400/25", tint: "bg-orange-500/10" },
  "collection-drop": { text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-600", border: "border-orange-500/30 dark:border-orange-400/25", tint: "bg-orange-500/10" },
  "pop-protocol": { text: "text-emerald-600 dark:text-emerald-400", solid: "bg-emerald-600", border: "border-emerald-500/30 dark:border-emerald-400/25", tint: "bg-emerald-500/10" },
  "remix-asset": { text: "text-indigo-600 dark:text-indigo-400", solid: "bg-indigo-600", border: "border-indigo-500/30 dark:border-indigo-400/25", tint: "bg-indigo-500/10" },
  "claim-username": { text: "text-violet-600 dark:text-violet-400", solid: "bg-violet-600", border: "border-violet-500/30 dark:border-violet-400/25", tint: "bg-violet-500/10" },
  "claim-collection": { text: "text-cyan-600 dark:text-cyan-400", solid: "bg-cyan-600", border: "border-cyan-500/30 dark:border-cyan-400/25", tint: "bg-cyan-500/10" },
  "claim-collection-name": { text: "text-pink-600 dark:text-pink-400", solid: "bg-pink-600", border: "border-pink-500/30 dark:border-pink-400/25", tint: "bg-pink-500/10" },
};

// ── Service card — the whole card is the action ─────────────────────────────

export interface LaunchpadServiceCardProps {
  def: ServiceDefinition;
  override?: ServiceOverride;
  /** Showcase layout — spans the full grid width (e.g. POP Protocol) */
  featured?: boolean;
  /** Grid position — drives the staggered entrance reveal. */
  index?: number;
}

export function LaunchpadServiceCard({ def, override = {}, featured = false, index = 0 }: LaunchpadServiceCardProps) {
  const { key, icon: Icon, title, browseLinkLabel, features } = def;
  const status = override.status ?? def.status;
  const blurb = override.blurb ?? def.blurb;
  const { href, browseHref } = override;
  const reduceMotion = useReducedMotion();

  const live = status === "live";
  const hue = SERVICE_HUES[key] ?? DEFAULT_HUE;

  return (
    <motion.div
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("flex", featured && "sm:col-span-2")}
    >
      <div
        className={cn(
          "group relative flex flex-1 flex-col overflow-hidden min-h-[200px] rounded-2xl border bg-card transition-all duration-300 ease-out",
          live
            ? cn("active:scale-[0.985] sm:hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none", hue.border, "sm:hover:shadow-md sm:hover:shadow-black/5 dark:sm:hover:shadow-black/20")
            : "border-border/30 opacity-75",
        )}
      >
          <div className="relative flex flex-col flex-1 p-5 sm:p-6 gap-3 sm:gap-4">
            <div className="flex items-start justify-between gap-3">
              {live ? (
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", hue.tint)}>
                  <Icon className={cn("h-6 w-6", hue.text)} />
                </span>
              ) : (
                <Icon className="h-8 w-8 shrink-0 text-muted-foreground/50" />
              )}
              {!live && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60 pt-1">
                  <Lock className="h-3 w-3" />
                  Coming soon
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">{title}</h3>
              <p className={cn("text-sm leading-relaxed", live ? "text-muted-foreground" : "text-muted-foreground/60", !featured && "max-w-[36ch]")}>
                {blurb}
              </p>
            </div>

            {/* Feature showcase — plain-language chips, capped at 2 for card density */}
            {live && features.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {features.slice(0, 2).map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/30 text-xs font-medium text-muted-foreground"
                  >
                    <Check className={cn("h-3 w-3 shrink-0", hue.text)} />
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {/* Stretched link — the whole card is the action; the button is the visual cue */}
            {live && href && <Link href={href} aria-label={`${def.cta} — ${title}`} className="absolute inset-0 z-10" />}

            <div className="mt-auto pt-1 flex items-end justify-between gap-3">
              {live && browseHref && browseLinkLabel ? (
                <Link
                  href={browseHref}
                  className="relative z-20 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground active:text-foreground sm:hover:text-foreground transition-colors"
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
                    "text-sm font-semibold text-white",
                    hue.solid,
                  )}
                >
                  {def.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 sm:group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </span>
              )}
            </div>
          </div>
      </div>
    </motion.div>
  );
}

// ── Group sections ───────────────────────────────────────────────────────────

/** Vivid gradient titles give special sections identity without boxing them in
 *  (no panels inside panels — color carries the distinction, space does the rest). */
const GROUP_TITLE_ACCENTS: Partial<Record<ServiceGroup, string>> = {
  "coins": "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent",
  "community": "bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent",
};

function GroupHeader({ group }: { group: ServiceGroupDefinition }) {
  return (
    <div className="space-y-2">
      <h2 className={cn("text-3xl sm:text-4xl font-black tracking-tight", GROUP_TITLE_ACCENTS[group.key])}>
        {group.title}
      </h2>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">{group.tagline}</p>
    </div>
  );
}

/** POP Protocol companion column — open how-it-works steps, no extra panel. */
const POP_STEPS = [
  { title: "Create your event badge", body: "Name it, add your artwork, and set who can claim — ready in minutes." },
  { title: "Share the claim link", body: "Your community claims for free — one badge per person, no faking." },
  { title: "It stays with them forever", body: "Badges can't be sold or transferred — lasting proof they were there." },
];

function PopHowItWorks() {
  return (
    <div className="flex flex-col justify-center gap-5 sm:gap-6 px-2 py-4 sm:py-0 sm:pl-6">
      {POP_STEPS.map((step, i) => (
        <div key={step.title} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
            {i + 1}
          </span>
          <div className="space-y-0.5">
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
          </div>
        </div>
      ))}
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

/**
 * Owns the search + group-filter state for the launchpad page. A page renders
 * `LaunchpadFilterBar` wherever it wants (e.g. right under the h1) wired to
 * this hook's fields, then passes `query`/`activeGroups` straight through to
 * `LaunchpadGroupedSections` so the grid reacts to the same state.
 */
export function useLaunchpadFilter() {
  const [query, setQuery] = useState("");
  const [activeGroups, setActiveGroups] = useState<Set<ServiceGroup>>(new Set());

  const filterableGroups = LAUNCHPAD_SERVICE_GROUPS.filter((g) => g.key !== "coming-soon");

  const toggleGroup = (key: ServiceGroup) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const matches = (def: ServiceDefinition): boolean => {
    if (activeGroups.size > 0 && !activeGroups.has(def.group)) return false;
    if (def.status !== "live") return false;
    if (query.trim() === "") return true;
    const haystack = `${def.title} ${def.blurb} ${def.subtitle}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  };

  const totalMatches = useMemo(
    () => LAUNCHPAD_SERVICE_DEFINITIONS.filter(matches).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, activeGroups],
  );

  const clear = () => { setQuery(""); setActiveGroups(new Set()); };

  return { query, setQuery, activeGroups, toggleGroup, filterableGroups, totalMatches, clear };
}

export interface LaunchpadGroupedSectionsProps {
  /** Per-app hrefs / rollout flips, keyed by service key. */
  overrides: ServiceOverrides;
  /** Current search query — from `useLaunchpadFilter()`. */
  query: string;
  /** Current active group filters — from `useLaunchpadFilter()`. */
  activeGroups: Set<ServiceGroup>;
  /** Reset both — from `useLaunchpadFilter()`. */
  onClearFilters: () => void;
  className?: string;
}

/** The full grouped launchpad services grid — section order comes from
 *  LAUNCHPAD_SERVICE_GROUPS; cards from LAUNCHPAD_SERVICE_DEFINITIONS.
 *  Fully controlled by `useLaunchpadFilter()` state passed in from the page. */
export function LaunchpadGroupedSections({ overrides, query, activeGroups, onClearFilters, className }: LaunchpadGroupedSectionsProps) {
  const matches = (def: ServiceDefinition): boolean => {
    if (activeGroups.size > 0 && !activeGroups.has(def.group)) return false;
    if (def.status !== "live") return false;
    if (query.trim() === "") return true;
    const haystack = `${def.title} ${def.blurb} ${def.subtitle}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  };

  const totalMatches = useMemo(
    () => LAUNCHPAD_SERVICE_DEFINITIONS.filter(matches).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, activeGroups],
  );

  return (
    <div className={cn("space-y-8 sm:space-y-10", className)}>
      {totalMatches === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg font-semibold">No services match</p>
          <p className="text-sm text-muted-foreground">Try a different search or clear your filters.</p>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-20 sm:space-y-28">
          <AnimatePresence>
            {LAUNCHPAD_SERVICE_GROUPS.map((group) => {
              if (group.key === "coming-soon") {
                // Coming-soon items are never "live" by definition, so they can't
                // go through matches() (which requires status === "live") — only
                // the group/search filters apply here, not the live-status gate.
                const inActiveGroup = (d: ServiceDefinition) => activeGroups.size === 0 || activeGroups.has(d.group);
                const inSearch = (d: ServiceDefinition) =>
                  query.trim() === "" ||
                  `${d.title} ${d.blurb} ${d.subtitle}`.toLowerCase().includes(query.trim().toLowerCase());
                const comingSoonDefs = LAUNCHPAD_SERVICE_DEFINITIONS.filter(
                  (d) => d.group === group.key && inActiveGroup(d) && inSearch(d),
                );
                if (comingSoonDefs.length === 0) return null;
                return <ComingSoonStrip key={group.key} group={group} defs={comingSoonDefs} />;
              }

              const defs = LAUNCHPAD_SERVICE_DEFINITIONS.filter((d) => d.group === group.key && matches(d));
              if (defs.length === 0) return null;

              const showPopHowItWorks = group.key === "community" && defs.some((d) => d.key === "pop-protocol");

              return (
                <motion.div
                  key={group.key}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="space-y-7 sm:space-y-10"
                >
                  <GroupHeader group={group} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {defs.map((def, i) => (
                      <LaunchpadServiceCard key={def.key} def={def} override={overrides[def.key]} index={i} />
                    ))}
                    {showPopHowItWorks && <PopHowItWorks />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
