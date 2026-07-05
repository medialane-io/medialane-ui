"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollSection } from "./scroll-section.js";
import { SERVICE_HUES } from "./launchpad-services.js";
import { LAUNCHPAD_SERVICE_DEFINITIONS } from "../data/launchpad-services.js";
import { cn } from "../utils/cn.js";

/** Homepage launchpad strip — cards derive from the shared launchpad service
 *  definitions: creator language, one blurb, one example, one vivid verb pill.
 *  No tech chips, no long descriptions. Apps inject only hrefs. */

export interface LaunchpadStripProps {
  /** Per-service destinations, keyed by service key. Services without an href are skipped. */
  hrefs: Record<string, string>;
  /** Marketplace card destination (omit to hide the marketplace card) */
  marketplaceHref?: string;
  /** "Explore" header link */
  launchpadHref?: string;
}

interface StripCard {
  key: string;
  href: string;
  icon: LucideIcon;
  title: string;
  blurb: string;
  example?: string;
  cta: string;
  hue: { text: string; solid: string; border: string; tint: string };
}

const DEF_BY_KEY = Object.fromEntries(LAUNCHPAD_SERVICE_DEFINITIONS.map((d) => [d.key, d]));

/** Display order on the homepage strip */
const STRIP_ORDER = [
  "mint-ip-asset",
  "create-collection",
  "ip-collection-1155",
  "mint-editions",
  "collection-drop",
  "pop-protocol",
];

const MARKETPLACE_HUE = {
  text: "text-indigo-600 dark:text-indigo-400",
  solid: "bg-indigo-600",
  border: "border-indigo-500/30 dark:border-indigo-400/25",
  tint: "bg-indigo-500/10",
};

function ServiceCard({ card }: { card: StripCard }) {
  const { icon: Icon, title, blurb, example, cta, hue, href } = card;
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden flex flex-col h-full min-h-[280px]",
        "transition-transform active:scale-[0.99]",
        hue.border,
      )}
    >
      <div className="relative flex flex-col flex-1 p-6 gap-3.5">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", hue.tint)}>
          <Icon className={cn("h-6 w-6", hue.text)} />
        </span>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black tracking-tight leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{blurb}</p>
          {example && (
            <p className="text-xs text-muted-foreground/70 italic leading-relaxed">e.g. {example}</p>
          )}
        </div>

        <div className="mt-auto pt-1 flex justify-end">
          <span
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-full",
              "text-sm font-semibold text-white",
              hue.solid,
            )}
          >
            {cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function LaunchpadStrip({
  hrefs,
  marketplaceHref,
  launchpadHref = "/launchpad",
}: LaunchpadStripProps) {
  const cards: StripCard[] = [
    ...STRIP_ORDER.flatMap((key) => {
      const def = DEF_BY_KEY[key];
      const href = hrefs[key];
      if (!def || !href) return [];
      return [{
        key,
        href,
        icon: def.icon,
        title: def.title,
        blurb: def.blurb,
        example: def.example,
        cta: def.cta,
        hue: SERVICE_HUES[key] ?? MARKETPLACE_HUE,
      }];
    }),
    ...(marketplaceHref
      ? [{
          key: "marketplace",
          href: marketplaceHref,
          icon: ShoppingBag,
          title: "Marketplace",
          blurb: "Discover and trade works from creators — gasless, instantly settled.",
          example: "Buy an art print, make an offer on a music track",
          cta: "Browse",
          hue: MARKETPLACE_HUE,
        }]
      : []),
  ];

  return (
    <ScrollSection
      icon={<Rocket className="h-3.5 w-3.5 text-white" />}
      iconBg="bg-gradient-to-br from-primary to-blue-600 shadow-md shadow-primary/20"
      title="Launchpad"
      href={launchpadHref}
      linkLabel="Explore"
    >
      {cards.map((card) => (
        <div key={card.key} className="w-64 sm:w-72 snap-start shrink-0 flex">
          <ServiceCard card={card} />
        </div>
      ))}
    </ScrollSection>
  );
}
