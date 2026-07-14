"use client";

/**
 * Launchpad services — the single source for the /launchpad page UI in
 * medialane-io and medialane-starknet.
 *
 * One dynamic grid (2026-07-13 redesign): one card per service, no group
 * sections. Groups exist as tags — a small accent label on the card and the
 * filter pills above the grid. The card is a single link to the service's own
 * page (its complete control surface); it carries no second link, no feature
 * chips, and no per-service color identity. Five group accents are the only
 * color voice, applied to the icon tile and the tag text.
 *
 * Filter state (search + group pills) lives in `useLaunchpadFilter()` so a
 * page can render `LaunchpadFilterBar` wherever it wants while
 * `LaunchpadGroupedSections` — fully controlled — renders the grid reacting
 * to that same state.
 *
 * Apps own: hrefs + per-app rollout status flips. Everything else lives here.
 */

import { useEffect, useMemo, useState } from "react";
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
  /** Legacy secondary link — the redesigned card renders a single link, so this is unused. */
  browseHref?: string;
  /** Per-app rollout flips (e.g. coins live on one app first) */
  status?: ServiceStatus;
  /** Per-app one-liner override (rarely needed) */
  blurb?: string;
}

export type ServiceOverrides = Record<string, ServiceOverride>;

// ── Group accents — the grid's only color voice ─────────────────────────────

/** The deck is the brand spectrum: each group owns one slice of the Medialane
 *  gradient (blue → indigo → purple → rose → orange), so the grid read in
 *  group order draws the full spectrum across the launchpad. The slice colors
 *  the icon chip, the use-case markers, and the desktop hover border — never
 *  text labels. */
interface GroupSlice {
  /** icon chip fill — a two-stop slice of the brand gradient */
  chip: string;
  /** use-case marker tint */
  marker: string;
  /** card border tint on desktop hover (polish only) */
  hoverBorder: string;
}

const DEFAULT_SLICE: GroupSlice = {
  chip: "bg-gradient-to-br from-muted to-muted",
  marker: "text-muted-foreground/60",
  hoverBorder: "sm:hover:border-border",
};

export const GROUP_SLICES: Record<ServiceGroup, GroupSlice> = {
  "nfts": {
    chip: "bg-gradient-to-br from-brand-blue to-brand-indigo",
    marker: "text-brand-blue",
    hoverBorder: "sm:hover:border-brand-blue/50",
  },
  "limited-editions": {
    chip: "bg-gradient-to-br from-brand-indigo to-brand-purple",
    marker: "text-brand-indigo",
    hoverBorder: "sm:hover:border-brand-indigo/50",
  },
  "coins": {
    chip: "bg-gradient-to-br from-brand-purple to-brand-rose",
    marker: "text-brand-purple",
    hoverBorder: "sm:hover:border-brand-purple/50",
  },
  "community": {
    chip: "bg-gradient-to-br from-brand-rose to-brand-orange",
    marker: "text-brand-rose",
    hoverBorder: "sm:hover:border-brand-rose/50",
  },
  "claims": {
    chip: "bg-gradient-to-br from-brand-orange to-brand-price",
    marker: "text-brand-orange",
    hoverBorder: "sm:hover:border-brand-orange/50",
  },
  "coming-soon": DEFAULT_SLICE,
};

/** Legacy per-service hue table — kept for LaunchpadStrip (homepage). The grid
 *  no longer uses it. */
interface ServiceHue {
  text: string;
  solid: string;
  border: string;
  tint: string;
}

export const SERVICE_HUES: Record<string, ServiceHue> = {
  "nfts": { text: "text-blue-600 dark:text-blue-400", solid: "bg-blue-600", border: "border-blue-500/30 dark:border-blue-400/25", tint: "bg-blue-500/10" },
  "limited-editions": { text: "text-purple-600 dark:text-purple-400", solid: "bg-purple-600", border: "border-purple-500/30 dark:border-purple-400/25", tint: "bg-purple-500/10" },
  "creator-coins": { text: "text-yellow-600 dark:text-yellow-400", solid: "bg-yellow-600", border: "border-yellow-500/30 dark:border-yellow-400/25", tint: "bg-yellow-500/10" },
  "claim-memecoin": { text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-600", border: "border-orange-500/30 dark:border-orange-400/25", tint: "bg-orange-500/10" },
  "collection-drop": { text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-600", border: "border-orange-500/30 dark:border-orange-400/25", tint: "bg-orange-500/10" },
  "pop-protocol": { text: "text-emerald-600 dark:text-emerald-400", solid: "bg-emerald-600", border: "border-emerald-500/30 dark:border-emerald-400/25", tint: "bg-emerald-500/10" },
  "ip-tickets": { text: "text-teal-600 dark:text-teal-400", solid: "bg-teal-600", border: "border-teal-500/30 dark:border-teal-400/25", tint: "bg-teal-500/10" },
  "remix-asset": { text: "text-indigo-600 dark:text-indigo-400", solid: "bg-indigo-600", border: "border-indigo-500/30 dark:border-indigo-400/25", tint: "bg-indigo-500/10" },
  "claim-username": { text: "text-violet-600 dark:text-violet-400", solid: "bg-violet-600", border: "border-violet-500/30 dark:border-violet-400/25", tint: "bg-violet-500/10" },
  "claim-collection": { text: "text-cyan-600 dark:text-cyan-400", solid: "bg-cyan-600", border: "border-cyan-500/30 dark:border-cyan-400/25", tint: "bg-cyan-500/10" },
  "claim-collection-name": { text: "text-pink-600 dark:text-pink-400", solid: "bg-pink-600", border: "border-pink-500/30 dark:border-pink-400/25", tint: "bg-pink-500/10" },
};

const GROUP_TITLE_BY_KEY = Object.fromEntries(
  LAUNCHPAD_SERVICE_GROUPS.map((g) => [g.key, g.title]),
) as Record<ServiceGroup, string>;

const GROUP_KEYS = new Set(LAUNCHPAD_SERVICE_GROUPS.map((g) => g.key));

// ── Service card — one link, one accent, title + one sentence ────────────────

export interface LaunchpadServiceCardProps {
  def: ServiceDefinition;
  override?: ServiceOverride;
  /** Grid position — drives the staggered entrance reveal. */
  index?: number;
}

export function LaunchpadServiceCard({ def, override = {}, index = 0 }: LaunchpadServiceCardProps) {
  const { icon: Icon, title, group, features, cta } = def;
  const status = override.status ?? def.status;
  const blurb = override.blurb ?? def.blurb;
  const { href } = override;
  const reduceMotion = useReducedMotion();

  const live = status === "live";
  const slice = GROUP_SLICES[group] ?? DEFAULT_SLICE;

  const body = (
    <>
      {/* Icon chip — the group's slice of the brand spectrum */}
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm", live ? slice.chip : "bg-muted/40")}>
          <Icon className={cn("h-7 w-7", live ? "text-white" : "text-muted-foreground/50")} />
        </span>
        {!live && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60 pt-1">
            <Lock className="h-3 w-3" />
            Coming soon
          </span>
        )}
      </div>

      {/* Title + one sentence */}
      <div className="mt-auto space-y-2 pt-6">
        <h3 className="text-2xl font-bold tracking-tight leading-tight">{title}</h3>
        <p className={cn("text-sm leading-relaxed", live ? "text-muted-foreground" : "text-muted-foreground/60")}>
          {blurb}
        </p>
      </div>

      {/* Use cases */}
      {live && features.length > 0 && (
        <ul className="space-y-1.5 pt-4">
          {features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
              <Check className={cn("h-3.5 w-3.5 shrink-0 mt-px", slice.marker)} />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* The action — one vivid full-spectrum pill, identical on every card */}
      {live && (
        <div className="pt-5">
          <span className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-brand-blue via-brand-purple to-brand-rose">
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 sm:group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </span>
        </div>
      )}
    </>
  );

  return (
    <motion.div
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileTap={live ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex"
    >
      {live && href ? (
        <Link
          href={href}
          className={cn(
            "group flex flex-1 flex-col rounded-3xl border border-border/60 bg-card p-6 sm:aspect-[4/5]",
            "transition-colors duration-200",
            slice.hoverBorder,
          )}
        >
          {body}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col rounded-3xl border border-border/30 bg-card p-6 sm:aspect-[4/5] opacity-75">
          {body}
        </div>
      )}
    </motion.div>
  );
}

// ── Coming-soon strip ────────────────────────────────────────────────────────

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

// ── Filter state ─────────────────────────────────────────────────────────────

/** Shared search predicate — group titles count as search terms so a query
 *  like "editions" or "community" finds the whole group. */
export function serviceMatchesQuery(def: ServiceDefinition, query: string): boolean {
  if (query.trim() === "") return true;
  const haystack = `${def.title} ${def.blurb} ${def.subtitle} ${GROUP_TITLE_BY_KEY[def.group] ?? ""}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

/** Sync filter state into the URL (?q=…&groups=…) via replaceState — the
 *  filtered launchpad becomes shareable and survives reload, without touching
 *  the router (this package is router-agnostic). */
function syncFilterUrl(query: string, groups: Set<ServiceGroup>) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (query.trim()) params.set("q", query.trim());
  else params.delete("q");
  if (groups.size > 0) params.set("groups", [...groups].join(","));
  else params.delete("groups");
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}

/**
 * Owns the search + group-filter state for the launchpad page. A page renders
 * `LaunchpadFilterBar` wherever it wants (e.g. right under the h1) wired to
 * this hook's fields, then passes `query`/`activeGroups` straight through to
 * `LaunchpadGroupedSections` so the grid reacts to the same state.
 * State is mirrored into the URL (?q=…&groups=…) so a filtered view can be
 * shared and survives reload.
 */
export function useLaunchpadFilter() {
  const [query, setQueryState] = useState("");
  const [activeGroups, setActiveGroups] = useState<Set<ServiceGroup>>(new Set());

  // Hydrate once from the URL (client only).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQueryState(q);
    const g = params.get("groups");
    if (g) {
      const groups = g.split(",").filter((k): k is ServiceGroup => GROUP_KEYS.has(k as ServiceGroup));
      if (groups.length > 0) setActiveGroups(new Set(groups));
    }
  }, []);

  const filterableGroups = LAUNCHPAD_SERVICE_GROUPS.filter((g) => g.key !== "coming-soon");

  const setQuery = (value: string) => {
    setQueryState(value);
    syncFilterUrl(value, activeGroups);
  };

  const toggleGroup = (key: ServiceGroup) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      syncFilterUrl(query, next);
      return next;
    });
  };

  const matches = (def: ServiceDefinition): boolean => {
    if (activeGroups.size > 0 && !activeGroups.has(def.group)) return false;
    if (def.status !== "live") return false;
    return serviceMatchesQuery(def, query);
  };

  const totalMatches = useMemo(
    () => LAUNCHPAD_SERVICE_DEFINITIONS.filter(matches).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, activeGroups],
  );

  const clear = () => {
    setQueryState("");
    setActiveGroups(new Set());
    syncFilterUrl("", new Set());
  };

  return { query, setQuery, activeGroups, toggleGroup, filterableGroups, totalMatches, clear };
}

// ── The grid ─────────────────────────────────────────────────────────────────

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

/** The full launchpad services grid — one dynamic grid of all live services,
 *  ordered by group, plus the coming-soon strip. Fully controlled by
 *  `useLaunchpadFilter()` state passed in from the page. */
export function LaunchpadGroupedSections({ overrides, query, activeGroups, onClearFilters, className }: LaunchpadGroupedSectionsProps) {
  const inActiveGroup = (d: ServiceDefinition) => activeGroups.size === 0 || activeGroups.has(d.group);
  const inSearch = (d: ServiceDefinition) => serviceMatchesQuery(d, query);

  const groupOrder = Object.fromEntries(LAUNCHPAD_SERVICE_GROUPS.map((g, i) => [g.key, i]));

  const liveDefs = LAUNCHPAD_SERVICE_DEFINITIONS
    .filter((d) => d.group !== "coming-soon" && d.status === "live" && inActiveGroup(d) && inSearch(d))
    .sort((a, b) => (groupOrder[a.group] ?? 99) - (groupOrder[b.group] ?? 99));

  const comingSoonGroup = LAUNCHPAD_SERVICE_GROUPS.find((g) => g.key === "coming-soon");
  const comingSoonDefs = LAUNCHPAD_SERVICE_DEFINITIONS.filter(
    (d) => d.group === "coming-soon" && inActiveGroup(d) && inSearch(d),
  );

  return (
    <div className={cn("space-y-8", className)}>
      {liveDefs.length === 0 && comingSoonDefs.length === 0 ? (
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
        <>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {liveDefs.map((def, i) => (
                <LaunchpadServiceCard key={def.key} def={def} override={overrides[def.key]} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
          {comingSoonGroup && comingSoonDefs.length > 0 && (
            <ComingSoonStrip group={comingSoonGroup} defs={comingSoonDefs} />
          )}
        </>
      )}
    </div>
  );
}
