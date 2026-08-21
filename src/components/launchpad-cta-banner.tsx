import type { ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "./link.js";
import { Button } from "./button.js";
import { cn } from "../utils/cn.js";

export interface LaunchpadCtaBannerProps {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  /** External links render a plain <a target="_blank"> with an ExternalLink
   *  icon; internal links route through next/link with an ArrowRight icon. */
  external?: boolean;
  /** Swaps the background gradient tint — "primary" for cross-app CTAs,
   *  "manage" for account/portfolio-management CTAs. */
  tone?: "primary" | "manage";
  className?: string;
}

const TONE_GRADIENT: Record<NonNullable<LaunchpadCtaBannerProps["tone"]>, string> = {
  primary: "bg-gradient-to-r from-brand-blue/10 to-brand-purple/10",
  manage: "bg-gradient-to-r from-brand-navy/10 to-brand-purple/10",
};

export function LaunchpadCtaBanner({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  external = false,
  tone = "primary",
  className,
}: LaunchpadCtaBannerProps) {
  const icon: ReactNode = external
    ? <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
    : <ArrowRight className="h-3.5 w-3.5 ml-1.5" />;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
        TONE_GRADIENT[tone],
        className
      )}
    >
      <div>
        <p className="section-label">{eyebrow}</p>
        <p className="font-bold text-base mt-0.5">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Button variant="outline" asChild className="shrink-0">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {ctaLabel} {icon}
          </a>
        ) : (
          <Link href={href}>
            {ctaLabel} {icon}
          </Link>
        )}
      </Button>
    </div>
  );
}
