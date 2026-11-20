"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "./link.js";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lock, ArrowRight, Check } from "lucide-react";
import { cn } from "../utils/cn.js";
import {
  LAUNCHPAD_SERVICE_DEFINITIONS,
  LAUNCHPAD_SERVICE_GROUPS,
  localizeGroup,
  localizeService,
  type ServiceDefinition,
  type ServiceGroup,
  type ServiceGroupDefinition,
  type ServiceStatus,
} from "../data/launchpad-services.js";
import { useT } from "../i18n/provider.js";

export interface ServiceOverride {

  href?: string;

  browseHref?: string;

  status?: ServiceStatus;

  blurb?: string;

  meta?: string;
}

export type ServiceOverrides = Record<string, ServiceOverride>;

export const LAUNCHPAD_ROUTE_OVERRIDES: ServiceOverrides = {
  "nfts": { href: "/launchpad/single-editions" },
  "create-collection": { href: "/launchpad/single-editions/collection" },
  "limited-editions": { href: "/launchpad/nfteditions" },
  "create-1155": { href: "/launchpad/nfteditions/create" },
  "remix-asset": { href: "/launchpad/remix" },
  "pop-protocol": { href: "/launchpad/pop" },
  "collection-drop": { href: "/launchpad/drop" },
  "creator-coins": { href: "/launchpad/coin/create" },
  "claim-memecoin": { href: "/launchpad/memecoin" },
  "claim-username": { href: "/claim/username" },
  "claim-collection": { href: "/claim/collection" },
  "claim-collection-name": { href: "/claim/collection-name" },
  "ip-tickets": { href: "/launchpad/tickets" },
  "ip-club": { href: "/launchpad/club" },
  "ip-sponsorship": { href: "/launchpad/sponsorship" },
};

interface GroupSlice {

  tint: string;

  text: string;

}

const DEFAULT_SLICE: GroupSlice = {
  tint: "bg-muted/60",
  text: "text-muted-foreground/60",
};

export const GROUP_SLICES: Record<ServiceGroup, GroupSlice> = {
  "single-nfts": { tint: "bg-brand-blue/10", text: "text-brand-blue" },
  "limited-editions": { tint: "bg-brand-maeve/10", text: "text-brand-maeve" },
  "coins": { tint: "bg-brand-purple/10", text: "text-brand-purple" },
  "membership": { tint: "bg-brand-rose/10", text: "text-brand-rose" },
  "licensing": { tint: "bg-brand-orange/10", text: "text-brand-orange" },
  "claims": { tint: "bg-brand-orange/10", text: "text-brand-orange" },
  "coming-soon": DEFAULT_SLICE,
};

interface ServiceHue {
  text: string;
  solid: string;
  tint: string;
}

export const SERVICE_HUES: Record<string, ServiceHue> = {
  "nfts": { text: "text-brand-blue", solid: "bg-brand-blue", tint: "bg-brand-blue/10" },
  "limited-editions": { text: "text-brand-maeve", solid: "bg-brand-maeve", tint: "bg-brand-maeve/10" },
  "creator-coins": { text: "text-brand-maeve", solid: "bg-brand-maeve", tint: "bg-brand-maeve/10" },
  "claim-memecoin": { text: "text-brand-orange", solid: "bg-brand-orange", tint: "bg-brand-orange/10" },
  "collection-drop": { text: "text-brand-purple", solid: "bg-brand-purple", tint: "bg-brand-purple/10" },
  "pop-protocol": { text: "text-brand-rose", solid: "bg-brand-rose", tint: "bg-brand-rose/10" },
  "ip-tickets": { text: "text-brand-orange", solid: "bg-brand-orange", tint: "bg-brand-orange/10" },
  "remix-asset": { text: "text-brand-maeve", solid: "bg-brand-maeve", tint: "bg-brand-maeve/10" },
  "claim-username": { text: "text-brand-purple", solid: "bg-brand-purple", tint: "bg-brand-purple/10" },
  "claim-collection": { text: "text-brand-blue", solid: "bg-brand-blue", tint: "bg-brand-blue/10" },
  "claim-collection-name": { text: "text-brand-rose", solid: "bg-brand-rose", tint: "bg-brand-rose/10" },
};

const GROUP_TITLE_BY_KEY = Object.fromEntries(
  LAUNCHPAD_SERVICE_GROUPS.map((g) => [g.key, g.title]),
) as Record<ServiceGroup, string>;

export interface LaunchpadServiceCardProps {
  def: ServiceDefinition;
  override?: ServiceOverride;

  index?: number;
}

export function LaunchpadServiceCard({ def: source, override = {}, index = 0 }: LaunchpadServiceCardProps) {
  const t = useT();
  const def = useMemo(() => localizeService(t, source), [t, source]);
  const { icon: Icon, title, group, features, cta } = def;
  const status = override.status ?? def.status;
  const blurb = override.blurb === undefined ? def.blurb : t(override.blurb);
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
            {t("Coming soon")}
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
          className="panel group flex flex-1 flex-col p-6 sm:aspect-[4/5] transition-colors hover:bg-background/40"
        >
          {body}
        </Link>
      ) : (
        <div className="panel flex flex-1 flex-col p-6 sm:aspect-[4/5] opacity-75">
          {body}
        </div>
      )}
    </motion.div>
  );
}

function ComingSoonStrip({ group, defs }: { group: ServiceGroupDefinition; defs: ServiceDefinition[] }) {
  const t = useT();
  const { title: groupTitle, tagline } = localizeGroup(t, group);
  return (
    <div className="panel p-5">
      <p className="font-semibold text-sm">{groupTitle}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{tagline}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {defs.map(({ key, icon: Icon, title }) => (
          <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/40">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs font-medium text-muted-foreground">{t(title)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function serviceMatchesQuery(def: ServiceDefinition, query: string, translate: (text: string) => string = (text) => text): boolean {
  if (query.trim() === "") return true;
  const local = localizeService(translate, def);
  const groupTitle = GROUP_TITLE_BY_KEY[def.group] ?? "";
  const haystack = `${def.title} ${def.blurb} ${def.subtitle} ${groupTitle} ${local.title} ${local.blurb} ${local.subtitle} ${translate(groupTitle)}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function syncFilterUrl(query: string) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (query.trim()) params.set("q", query.trim());
  else params.delete("q");
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}

export function useLaunchpadFilter() {
  const [query, setQueryState] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQueryState(q);
  }, []);

  const setQuery = (value: string) => {
    setQueryState(value);
    syncFilterUrl(value);
  };

  const clear = () => setQuery("");

  return { query, setQuery, clear };
}

export interface LaunchpadServiceSelection {
  query: string;
  hideGroups?: string[];
  excludeKeys?: string[];
  translate?: (text: string) => string;
}

export function selectLaunchpadServices({ query, hideGroups = [], excludeKeys = [], translate }: LaunchpadServiceSelection): ServiceDefinition[] {
  return LAUNCHPAD_SERVICE_DEFINITIONS.filter(
    (d) =>
      !excludeKeys.includes(d.key) &&
      !hideGroups.includes(d.group) &&
      (d.group === "coming-soon" || d.status === "live") &&
      serviceMatchesQuery(d, query, translate),
  );
}

export interface LaunchpadGroupedSectionsProps {

  overrides: ServiceOverrides;

  defs: ServiceDefinition[];

  onClearFilters: () => void;
  className?: string;
}

export function launchpadSectionId(group: ServiceGroup): string {
  return `launchpad-${group}`;
}

export function LaunchpadGroupedSections({ overrides, defs, onClearFilters, className }: LaunchpadGroupedSectionsProps) {
  const t = useT();
  const sections = LAUNCHPAD_SERVICE_GROUPS
    .filter((g) => g.key !== "coming-soon")
    .map((group) => ({ group: localizeGroup(t, group), source: group, defs: defs.filter((d) => d.group === group.key) }))
    .filter((s) => s.defs.length > 0);

  const comingSoonGroup = LAUNCHPAD_SERVICE_GROUPS.find((g) => g.key === "coming-soon");
  const comingSoonDefs = defs.filter((d) => d.group === "coming-soon");

  return (
    <div className={cn("space-y-12 sm:space-y-16", className)}>
      {sections.length === 0 && comingSoonDefs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg font-semibold">{t("No services match")}</p>
          <p className="text-sm text-muted-foreground">{t("Try a different search or clear your search.")}</p>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
          >
            {t("Clear search")}
          </button>
        </div>
      ) : (
        <>
          {sections.map(({ group, defs: groupDefs }) => (
            <section
              key={group.key}
              id={launchpadSectionId(group.key)}
              aria-labelledby={`${launchpadSectionId(group.key)}-title`}
              className="scroll-mt-20 space-y-5"
            >
              <div className="space-y-1">
                <h2 id={`${launchpadSectionId(group.key)}-title`} className="text-2xl sm:text-3xl font-semibold leading-tight">
                  {group.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">{group.tagline}</p>
              </div>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {groupDefs.map((def, i) => (
                    <LaunchpadServiceCard key={def.key} def={def} override={overrides[def.key]} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          ))}
          {comingSoonGroup && comingSoonDefs.length > 0 && (
            <ComingSoonStrip group={comingSoonGroup} defs={comingSoonDefs} />
          )}
        </>
      )}
    </div>
  );
}
