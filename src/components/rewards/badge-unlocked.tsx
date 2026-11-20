"use client";

import { BadgeIcon } from "./badge-shelf.js";
import type { BadgeShelfBadge } from "./badge-shelf.js";
import { useT } from "../../i18n/provider.js";

export interface BadgeUnlockedProps {
  badge: BadgeShelfBadge;
}

export function BadgeUnlocked({ badge }: BadgeUnlockedProps) {
  const t = useT();
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${badge.color}18` }}
      >
        <BadgeIcon name={badge.icon} color={badge.color} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{t("Badge earned · {name}", { name: badge.name })}</p>
        <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
      </div>
    </div>
  );
}
