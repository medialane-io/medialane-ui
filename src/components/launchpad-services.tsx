"use client";

/**
 * Launchpad grouped services — the single source for the /launchpad page UI
 * in medialane-io and medialane-dapp (consolidated 2026-06-10; replaces the
 * old flat LaunchpadServicesGrid).
 *
 * Apps own: hrefs, button labels, per-app status/badge flips (rollout), and
 * any copy overrides (e.g. the gasless-rail chip wording). Everything else —
 * card design, group order, colors, copy — lives here.
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
  /** Primary CTA href — required for live services */
  href?: string;
  buttonLabel?: string;
  /** Secondary browse link href (pairs with the def's browseLinkLabel) */
  browseHref?: string;
  /** Per-app rollout flips (e.g. coins live on one app first) */
  status?: ServiceStatus;
  badge?: string;
  /** Per-app copy overrides (e.g. "Gasless via ChipiPay" vs "Gasless transactions") */
  features?: string[];
  description?: string;
  subtitle?: string;
}

export type ServiceOverrides = Record<string, ServiceOverride>;

// ── Brand color map per service key ──────────────────────────────────────────

interface ServiceCardColors {
  icon: string;
  button: string;
  chip: string;
  gradient: string;
}

const DEFAULT_COLORS: ServiceCardColors = {
  icon: "text-brand-blue",
  button: "bg-brand-blue",
  chip: "border-border/50 text-muted-foreground bg-muted/30",
  gradient: "from-border/40 to-border/20",
};

export const SERVICE_CARD_COLORS: Record<string, ServiceCardColors> = {
  "mint-ip-asset": { icon: "text-brand-blue", button: "bg-brand-blue", chip: "border-blue-500/30 text-blue-400 bg-blue-500/10", gradient: "from-blue-500/50 via-cyan-400/20 to-blue-600/30" },
  "create-collection": { icon: "text-brand-purple", button: "bg-brand-purple", chip: "border-purple-500/30 text-purple-400 bg-purple-500/10", gradient: "from-purple-500/50 via-violet-400/20 to-purple-700/30" },
  "ip-collection-1155": { icon: "text-brand-rose", button: "bg-brand-rose", chip: "border-rose-500/30 text-rose-400 bg-rose-500/10", gradient: "from-rose-500/50 via-pink-400/20 to-rose-700/30" },
  "mint-editions": { icon: "text-brand-orange", button: "bg-brand-orange", chip: "border-orange-500/30 text-orange-400 bg-orange-500/10", gradient: "from-orange-500/50 via-amber-400/20 to-orange-700/30" },
  "remix-asset": { icon: "text-brand-navy", button: "bg-brand-navy", chip: "border-indigo-700/30 text-indigo-300 bg-indigo-900/20", gradient: "from-blue-900/60 via-indigo-700/20 to-blue-800/30" },
  "pop-protocol": { icon: "text-brand-orange", button: "bg-brand-orange", chip: "border-orange-500/30 text-orange-400 bg-orange-500/10", gradient: "from-orange-500/50 via-amber-400/20 to-orange-700/30" },
  "collection-drop": { icon: "text-brand-rose", button: "bg-brand-rose", chip: "border-rose-500/30 text-rose-400 bg-rose-500/10", gradient: "from-rose-500/50 via-red-400/20 to-rose-700/30" },
  "ip-tickets": { icon: "text-brand-blue", button: "bg-brand-blue", chip: "border-blue-500/30 text-blue-400 bg-blue-500/10", gradient: "from-blue-500/50 via-cyan-400/20 to-blue-600/30" },
  "membership": { icon: "text-brand-purple", button: "bg-brand-purple", chip: "border-purple-500/30 text-purple-400 bg-purple-500/10", gradient: "from-purple-500/50 via-violet-400/20 to-purple-700/30" },
  "subscriptions": { icon: "text-brand-blue", button: "bg-brand-blue", chip: "border-blue-500/30 text-blue-400 bg-blue-500/10", gradient: "from-blue-500/50 via-cyan-400/20 to-blue-600/30" },
  "ip-coins": { icon: "text-brand-orange", button: "bg-brand-orange", chip: "border-orange-500/30 text-orange-400 bg-orange-500/10", gradient: "from-orange-500/50 via-amber-400/20 to-orange-700/30" },
  "creator-coins": { icon: "text-brand-rose", button: "bg-brand-rose", chip: "border-rose-500/30 text-rose-400 bg-rose-500/10", gradient: "from-rose-500/50 via-pink-400/20 to-rose-700/30" },
  "claim-memecoin": { icon: "text-brand-orange", button: "bg-brand-orange", chip: "border-orange-500/30 text-orange-400 bg-orange-500/10", gradient: "from-orange-500/50 via-amber-400/20 to-orange-700/30" },
  "claim-username": { icon: "text-brand-purple", button: "bg-brand-purple", chip: "border-purple-500/30 text-purple-400 bg-purple-500/10", gradient: "from-purple-500/50 via-violet-400/20 to-purple-700/30" },
  "claim-collection": { icon: "text-brand-blue", button: "bg-brand-blue", chip: "border-blue-500/30 text-blue-400 bg-blue-500/10", gradient: "from-blue-500/50 via-cyan-400/20 to-blue-600/30" },
};

// ── Service card ─────────────────────────────────────────────────────────────

export interface LaunchpadServiceCardProps {
  def: ServiceDefinition;
  override?: ServiceOverride;
}

export function LaunchpadServiceCard({ def, override = {} }: LaunchpadServiceCardProps) {
  const { key, icon: Icon, browseLinkLabel } = def;
  const status = override.status ?? def.status;
  const badge = override.badge ?? def.badge;
  const subtitle = override.subtitle ?? def.subtitle;
  const description = override.description ?? def.description;
  const features = override.features ?? def.features;
  const { href, buttonLabel, browseHref } = override;

  const live = status === "live";
  const building = status === "building";
  const active = live || building;
  const colors = SERVICE_CARD_COLORS[key] ?? DEFAULT_COLORS;

  const card = (
    <div
      className={cn(
        "relative rounded-[15px] bg-card flex flex-col overflow-hidden",
        "transition-all duration-200 flex-1",
        !active && "opacity-80",
      )}
    >
      {/* Atmospheric wash — per-service color, fades to nothing */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none",
          colors.gradient,
          active ? "opacity-[0.13]" : "opacity-[0.05]",
        )}
      />
      <div className="relative flex flex-col flex-1 p-6 gap-4">
        {/* Icon (soft glow) + status badge */}
        <div className="flex items-start justify-between">
          <div className="relative">
            {active && (
              <div aria-hidden className={cn("absolute -inset-3 rounded-full blur-2xl opacity-30", colors.button)} />
            )}
            <Icon className={cn("relative h-10 w-10 transition-transform duration-300", active ? colors.icon : "text-muted-foreground/45")} />
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold tracking-widest uppercase rounded-full px-2.5 py-1 flex items-center gap-1.5",
              live
                ? "text-emerald-500 bg-emerald-500/10"
                : building
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-muted-foreground/40 bg-muted/30",
            )}
          >
            {live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {!active && <Lock className="h-2.5 w-2.5" />}
            {badge}
          </span>
        </div>

        {/* Title + subtitle */}
        <div className="space-y-1">
          <p className={cn("text-2xl font-bold leading-snug tracking-tight", !active && "text-foreground/60")}>
            {def.title}
          </p>
          <p className={cn("text-[13px] leading-relaxed", active ? "text-muted-foreground" : "text-muted-foreground/50")}>
            {subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className={cn("text-sm leading-relaxed", active ? "text-muted-foreground" : "text-muted-foreground/50")}>
            {description}
          </p>
          {def.example && active && (
            <p className="text-xs text-muted-foreground/60 italic">{def.example}</p>
          )}
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-1.5">
          {features.map((f) => (
            <span
              key={f}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border font-medium",
                active ? colors.chip : "bg-muted/10 border-border/15 text-muted-foreground/45",
              )}
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA — pinned to the card bottom */}
        {live && href ? (
          <div className="space-y-2 mt-auto pt-2">
            <Link
              href={href}
              className={cn(
                "flex items-center justify-between w-full h-10 px-4 rounded-xl",
                "text-sm font-semibold text-white",
                "transition-all hover:brightness-110 active:scale-[0.98]",
                colors.button,
              )}
            >
              {buttonLabel ?? "Get started"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {browseHref && browseLinkLabel && (
              <Link
                href={browseHref}
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {browseLinkLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 h-10 mt-auto pt-2 text-sm text-muted-foreground/50 font-medium">
            <Lock className="h-3.5 w-3.5" />
            {building ? "In development" : "Coming soon"}
          </div>
        )}
      </div>
    </div>
  );

  return live ? (
    <div className={cn("p-[1px] rounded-2xl bg-gradient-to-br", colors.gradient, "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/25 flex flex-col")}>
      {card}
    </div>
  ) : (
    <div className="rounded-2xl border border-border/25 flex flex-col">{card}</div>
  );
}

// ── Group sections ───────────────────────────────────────────────────────────

function GroupHeader({ group }: { group: ServiceGroupDefinition }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
        {group.badge ? (
          <span className="text-[10px] font-semibold tracking-widest uppercase rounded-full px-2 py-0.5 bg-muted/40 text-muted-foreground">
            {group.badge}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">{group.tagline}</p>
    </div>
  );
}

function ComingSoonStrip({ group, defs }: { group: ServiceGroupDefinition; defs: ServiceDefinition[] }) {
  return (
    <div className="rounded-2xl border border-border/25 p-5">
      <p className="section-label">{group.title}</p>
      <p className="text-sm text-muted-foreground mt-1">{group.tagline}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {defs.map(({ key, icon: Icon, title, subtitle }) => (
          <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/30 border border-border/25">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
            <span className="hidden sm:inline text-xs text-muted-foreground/50">— {subtitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface LaunchpadGroupedSectionsProps {
  /** Per-app hrefs / labels / rollout flips / copy overrides, keyed by service key. */
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
