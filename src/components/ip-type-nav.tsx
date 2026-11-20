"use client";

import Link from "./link.js";
import { LayoutGrid } from "lucide-react";
import { SectionHeading } from "./section-heading.js";
import { IP_TYPE_CONFIG } from "./ip-type-badge.js";
import { cn } from "../utils/cn.js";
import { useT } from "../i18n/provider.js";

import { msg } from "../i18n/translate.js";
export function IpTypeNav() {
  const t = useT();
  return (
    <section className="space-y-4">
      <SectionHeading icon={<LayoutGrid />} title={t("Browse by type")} href="/nft" linkLabel={msg("View all")} />

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {IP_TYPE_CONFIG.map(({ slug, label, icon: Icon, colorClass, bgClass }) => (
          <Link
            key={slug}
            href={`/${slug}`}
            className="panel group flex flex-col items-center gap-2.5 p-4 hover:bg-card/80 transition-all hover:shadow-md hover:shadow-black/10"
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", bgClass)}>
              <Icon className={cn("h-5 w-5", colorClass)} />
            </div>
            <span className="text-xs font-semibold text-center leading-tight">{t(label)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
