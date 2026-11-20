"use client";

import Link from "./link.js";
import { ShoppingBag, ArrowRight, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollSection } from "./scroll-section.js";
import { SERVICE_HUES } from "./launchpad-services.js";
import { LAUNCHPAD_SERVICE_DEFINITIONS, localizeService } from "../data/launchpad-services.js";
import { cn } from "../utils/cn.js";
import { useT } from "../i18n/provider.js";

import { msg } from "../i18n/translate.js";
import { IconTile } from "./icon-tile.js";
export interface LaunchpadStripProps {

  hrefs: Record<string, string>;

  marketplaceHref?: string;

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
  hue: { solid: string };
}

const DEF_BY_KEY = Object.fromEntries(LAUNCHPAD_SERVICE_DEFINITIONS.map((d) => [d.key, d]));

const STRIP_ORDER = [
  "nfts",
  "limited-editions",
  "collection-drop",
  "pop-protocol",
  "ip-tickets",
  "creator-coins",
];

const MARKETPLACE_HUE = { solid: "bg-brand-maeve" };

function ServiceCard({ card }: { card: StripCard }) {
  const { icon: Icon, title, blurb, example, cta, hue, href } = card;
  return (
    <Link
      href={href}
      className="panel relative overflow-hidden flex flex-col h-full min-h-[280px] transition-transform active:scale-[0.99]"
    >
      <div className="relative flex flex-col flex-1 p-6 gap-3.5">
        <IconTile>
          <Icon />
        </IconTile>

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
  const t = useT();
  const cards: StripCard[] = [
    ...STRIP_ORDER.flatMap((key) => {
      const source = DEF_BY_KEY[key];
      const href = hrefs[key];
      if (!source || !href) return [];
      const def = localizeService(t, source);
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
          title: t("Marketplace"),
          blurb: t("Discover and trade works from creators — gasless, instantly settled."),
          example: t("Buy an art print, make an offer on a music track"),
          cta: t("Browse"),
          hue: MARKETPLACE_HUE,
        }]
      : []),
  ];

  return (
    <ScrollSection
      icon={<Rocket className="h-4 w-4" />}
      title={t("Launchpad")}
      href={launchpadHref}
      linkLabel={msg("Explore")}
    >
      {cards.map((card) => (
        <div key={card.key} className="w-64 sm:w-72 snap-start shrink-0 flex">
          <ServiceCard card={card} />
        </div>
      ))}
    </ScrollSection>
  );
}
