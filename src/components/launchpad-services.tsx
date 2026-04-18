"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import type { ServiceDefinition } from "../data/launchpad-services.js";

export type { ServiceStatus, ServiceCategory, ServiceDefinition } from "../data/launchpad-services.js";

export interface ServiceCardProps extends ServiceDefinition {
  /** Primary CTA href — required for live services */
  href?: string;
  /** Primary CTA button label */
  buttonLabel?: string;
  /** Secondary browse link href */
  browseHref?: string;
}

function ServiceCard({
  title,
  subtitle,
  description,
  features,
  icon: Icon,
  gradient,
  borderColor,
  iconColor,
  buttonColor,
  badge,
  status,
  href,
  buttonLabel,
  browseHref,
  browseLinkLabel,
}: ServiceCardProps) {
  const live = status === "live";
  const building = status === "building";
  const active = live || building;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col",
        `bg-gradient-to-br ${gradient}`,
        active ? borderColor : "border-border/20",
        live && "hover:-translate-y-[3px] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        !active && "opacity-60"
      )}
    >
      <div className="flex flex-col flex-1 p-7 gap-6">

        {/* Icon + status badge */}
        <div className="flex items-start justify-between">
          <Icon
            className={cn(
              "h-9 w-9 transition-transform duration-300",
              active ? iconColor : "text-muted-foreground/25",
              live && "group-hover:scale-110"
            )}
          />
          <span
            className={cn(
              "text-[10px] font-semibold tracking-widest uppercase rounded-full px-2.5 py-1 flex items-center gap-1.5",
              live
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : building
                  ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                  : "text-muted-foreground/40 bg-muted/30"
            )}
          >
            {live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {!active && <Lock className="h-2.5 w-2.5" />}
            {badge}
          </span>
        </div>

        {/* Title + subtitle */}
        <div className="space-y-1.5">
          <p
            className={cn(
              "text-xl sm:text-2xl font-bold leading-snug tracking-tight",
              !active && "text-foreground/40"
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-xs leading-relaxed",
              active ? "text-muted-foreground" : "text-muted-foreground/30"
            )}
          >
            {subtitle}
          </p>
        </div>

        {/* Description */}
        <p
          className={cn(
            "text-sm leading-relaxed flex-1",
            active ? "text-muted-foreground" : "text-muted-foreground/30"
          )}
        >
          {description}
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-1.5">
          {features.map((f) => (
            <span
              key={f}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border font-medium",
                active
                  ? "bg-background/50 border-border/50 text-muted-foreground"
                  : "bg-muted/10 border-border/15 text-muted-foreground/25"
              )}
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        {live && href ? (
          <div className="space-y-2">
            <Link
              href={href}
              className={cn(
                "flex items-center justify-between w-full h-10 px-4 rounded-xl",
                "text-sm font-semibold text-white",
                "transition-all duration-200 active:scale-[0.98]",
                buttonColor
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
          <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground/30 font-medium">
            <Lock className="h-3.5 w-3.5" />
            {building ? "In development" : "Coming soon"}
          </div>
        )}

      </div>
    </div>
  );
}

export interface LaunchpadServicesGridProps {
  services: ServiceCardProps[];
  className?: string;
}

export function LaunchpadServicesGrid({ services, className }: LaunchpadServicesGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {services.map(({ key, ...rest }) => (
        <ServiceCard key={key} {...rest} />
      ))}
    </div>
  );
}
