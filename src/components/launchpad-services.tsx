"use client";

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

export interface ServiceOverride {

  href?: string;

  browseHref?: string;

  status?: ServiceStatus;

  blurb?: string;

  meta?: string;
}

export type ServiceOverrides = Record<string, ServiceOverride>;

interface GroupSlice {

  tint: string;

  text: string;

  border: string;
}

const DEFAULT_SLICE: GroupSlice = {
  tint: "bg-muted/60",
  text: "text-muted-foreground/60",
  border: "border-border/60",
};

export const GROUP_SLICES: Record<ServiceGroup, GroupSlice> = {
  "nfts": { tint: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/30" },
  "limited-editions": { tint: "bg-brand-maeve/10", text: "text-brand-maeve", border: "border-brand-maeve/30" },
  "coins": { tint: "bg-brand-purple/10", text: "text-brand-purple", border: "border-brand-purple/30" },
  "community": { tint: "bg-brand-rose/10", text: "text-brand-rose", border: "border-brand-rose/30" },
  "claims": { tint: "bg-brand-orange/10", text: "text-brand-orange", border: "border-brand-orange/30" },
  "coming-soon": DEFAULT_SLICE,
};

interface ServiceHue {
  text: string;
  solid: string;
  border: string;
  tint: string;
}

export const SERVICE_HUES: Record<string, ServiceHue> = {
  "nfts": { text: "text-brand-blue", solid: "bg-brand-blue", border: "border-brand-blue/30", tint: "bg-brand-blue/10" },
  "limited-editions": { text: "text-brand-maeve", solid: "bg-brand-maeve", border: "border-brand-maeve/30", tint: "bg-brand-maeve/10" },
  "creator-coins": { text: "text-brand-maeve", solid: "bg-brand-maeve", border: "border-brand-maeve/30", tint: "bg-brand-maeve/10" },
  "claim-memecoin": { text: "text-brand-orange", solid: "bg-brand-orange", border: "border-brand-orange/30", tint: "bg-brand-orange/10" },
  "collection-drop": { text: "text-brand-purple", solid: "bg-brand-purple", border: "border-brand-purple/30", tint: "bg-brand-purple/10" },
  "pop-protocol": { text: "text-brand-rose", solid: "bg-brand-rose", border: "border-brand-rose/30", tint: "bg-brand-rose/10" },
  "ip-tickets": { text: "text-brand-orange", solid: "bg-brand-orange", border: "border-brand-orange/30", tint: "bg-brand-orange/10" },
  "remix-asset": { text: "text-brand-maeve", solid: "bg-brand-maeve", border: "border-brand-maeve/30", tint: "bg-brand-maeve/10" },
  "claim-username": { text: "text-brand-purple", solid: "bg-brand-purple", border: "border-brand-purple/30", tint: "bg-brand-purple/10" },
  "claim-collection": { text: "text-brand-blue", solid: "bg-brand-blue", border: "border-brand-blue/30", tint: "bg-brand-blue/10" },
  "claim-collection-name": { text: "text-brand-rose", solid: "bg-brand-rose", border: "border-brand-rose/30", tint: "bg-brand-rose/10" },
};

const GROUP_TITLE_BY_KEY = Object.fromEntries(
  LAUNCHPAD_SERVICE_GROUPS.map((g) => [g.key, g.title]),
) as Record<ServiceGroup, string>;

const GROUP_KEYS = new Set(LAUNCHPAD_SERVICE_GROUPS.map((g) => g.key));

export interface LaunchpadServiceCardProps {
  def: ServiceDefinition;
  override?: ServiceOverride;

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

      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", live ? slice.tint : "bg-muted/40")}>
          <Icon className={cn("h-7 w-7", live ? slice.text : "text-muted-foreground/50")} />
        </span>
        {!live ? (
          <span className="flex items-center gap-1 text-2xs font-medium text-muted-foreground/60 pt-1">
            <Lock className="h-3 w-3" />
            Coming soon
          </span>
        ) : override.meta ? (
          <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full bg-muted/50 text-foreground/80">
            {override.meta}
          </span>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-6">
        <h3 className="text-2xl font-bold tracking-tight leading-tight">{title}</h3>
        <p className={cn("text-sm leading-relaxed", live ? "text-muted-foreground" : "text-muted-foreground/60")}>
          {blurb}
        </p>
      </div>

      {live && features.length > 0 && (
        <ul className="space-y-1.5 pt-4">
          {features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
              <Check className={cn("h-3.5 w-3.5 shrink-0 mt-px", slice.text)} />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {live && (
        <div className="pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
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
            "group flex flex-1 flex-col rounded-3xl border bg-card p-6 sm:aspect-[4/5]",
            "ml-grad-hover-border",
            slice.border,
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

export function serviceMatchesQuery(def: ServiceDefinition, query: string): boolean {
  if (query.trim() === "") return true;
  const haystack = `${def.title} ${def.blurb} ${def.subtitle} ${GROUP_TITLE_BY_KEY[def.group] ?? ""}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

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

export function useLaunchpadFilter() {
  const [query, setQueryState] = useState("");
  const [activeGroups, setActiveGroups] = useState<Set<ServiceGroup>>(new Set());

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

    [query, activeGroups],
  );

  const clear = () => {
    setQueryState("");
    setActiveGroups(new Set());
    syncFilterUrl("", new Set());
  };

  return { query, setQuery, activeGroups, toggleGroup, filterableGroups, totalMatches, clear };
}

export interface LaunchpadGroupedSectionsProps {

  overrides: ServiceOverrides;

  query: string;

  activeGroups: Set<ServiceGroup>;

  onClearFilters: () => void;
  className?: string;

  excludeKeys?: string[];
}

export function LaunchpadGroupedSections({ overrides, query, activeGroups, onClearFilters, className, excludeKeys }: LaunchpadGroupedSectionsProps) {
  const inActiveGroup = (d: ServiceDefinition) => activeGroups.size === 0 || activeGroups.has(d.group);
  const inSearch = (d: ServiceDefinition) => serviceMatchesQuery(d, query);
  const notExcluded = (d: ServiceDefinition) => !excludeKeys?.includes(d.key);

  const groupOrder = Object.fromEntries(LAUNCHPAD_SERVICE_GROUPS.map((g, i) => [g.key, i]));

  const liveDefs = LAUNCHPAD_SERVICE_DEFINITIONS
    .filter((d) => d.group !== "coming-soon" && d.status === "live" && notExcluded(d) && inActiveGroup(d) && inSearch(d))
    .sort((a, b) => (groupOrder[a.group] ?? 99) - (groupOrder[b.group] ?? 99));

  const comingSoonGroup = LAUNCHPAD_SERVICE_GROUPS.find((g) => g.key === "coming-soon");
  const comingSoonDefs = LAUNCHPAD_SERVICE_DEFINITIONS.filter(
    (d) => d.group === "coming-soon" && notExcluded(d) && inActiveGroup(d) && inSearch(d),
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
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
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
