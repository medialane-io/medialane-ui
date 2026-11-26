"use client";

import type { LucideIcon } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { IconTile } from "./icon-tile.js";

export interface ClaimRailProps {

  included?: { icon: LucideIcon; title: string; desc: string }[];

  steps: string[];
}

export function ClaimRail({ included, steps }: ClaimRailProps) {
  const t = useT();
  return (
    <div className="rounded-2xl bg-muted/50 dark:bg-card divide-y divide-border/60 overflow-hidden">
      {included && included.length > 0 && (
        <section className="p-5">
          <p className="section-label">{t("What you get")}</p>
          <ul className="mt-4 space-y-4">
            {included.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <IconTile size="sm">
                  <Icon />
                </IconTile>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="p-5">
        <p className="section-label">{t("How it works")}</p>
        <ol className="mt-4 space-y-3">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <IconTile size="sm" className="tabular-nums">
                {i + 1}
              </IconTile>
              <span className="text-sm text-foreground/90">{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
