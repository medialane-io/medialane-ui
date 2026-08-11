import { cn } from "../../utils/cn.js";
import { BadgeIcon } from "./badge-shelf.js";

export interface BadgeCatalogBadge {
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

export interface BadgeCatalogProps {
  badges: BadgeCatalogBadge[];
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  creator: "Creator",
  collector: "Collector",
  community: "Community",
};

/** Full badge catalog, grouped by category — "what's achievable," not
 *  "what you've done" (no earned/locked state; that's BadgeShelf's job on
 *  /rewards, which stays exactly as-is for the viewer's own progress).
 *  Groups render in whatever categories are actually present in the data,
 *  not a hardcoded list — new categories show up automatically. */
export function BadgeCatalog({ badges, className }: BadgeCatalogProps) {
  const categories = [...new Set(badges.map((b) => b.category))];

  return (
    <div className={cn("space-y-8", className)}>
      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <p className="text-sm font-black uppercase tracking-wide text-foreground/50">
            {CATEGORY_LABELS[cat] ?? cat}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges
              .filter((b) => b.category === cat)
              .map((badge) => (
                <div key={badge.key} className="flex items-center gap-3 rounded-2xl bg-foreground/[0.04] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-gradient-to-br from-brand-orange to-brand-maeve">
                    <BadgeIcon name={badge.icon} color="#ffffff" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{badge.name}</p>
                    <p className="text-xs text-foreground/60 truncate">{badge.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
