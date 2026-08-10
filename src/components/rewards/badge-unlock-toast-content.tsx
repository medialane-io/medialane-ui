import { BadgeIcon } from "./badge-shelf.js";
import type { BadgeShelfBadge } from "./badge-shelf.js";

export interface BadgeUnlockToastContentProps {
  badge: BadgeShelfBadge;
}

/** Toast body for a newly-earned badge: icon, name, description — the
 *  badge equivalent of XpToastContent. */
export function BadgeUnlockToastContent({ badge }: BadgeUnlockToastContentProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: `${badge.color}60`, backgroundColor: `${badge.color}18` }}
      >
        <BadgeIcon name={badge.icon} color={badge.color} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Badge earned · {badge.name}</p>
        <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
      </div>
    </div>
  );
}
