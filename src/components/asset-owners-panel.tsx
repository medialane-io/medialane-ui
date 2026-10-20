"use client";

import Link from "./link.js";
import { AddressDisplay } from "./address-display.js";
import { CreatorScoreInline } from "./creator-score-inline.js";

interface HolderLike {
  owner: string;
  amount: string;
}

interface AssetOwnersPanelProps {
  balances: HolderLike[];
  total?: number;
  editions?: number;
}

const MAX_VISIBLE = 5;

function plural(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

export function AssetOwnersPanel({ balances, total = balances.length, editions }: AssetOwnersPanelProps) {
  if (balances.length === 0) return null;

  const owners = plural(total, "owner");
  const label = editions ? `${plural(editions, "edition")} · ${owners}` : owners;

  return (
    <div className="rounded-xl border border-border px-4 py-3 space-y-2">
      <p className="text-2xs font-semibold text-muted-foreground tabular-nums">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {balances.slice(0, MAX_VISIBLE).map((balance) => (
          <div key={balance.owner} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Link
                href={`/creator/${balance.owner}`}
                className="hover:text-primary transition-colors font-medium text-sm truncate"
              >
                <AddressDisplay address={balance.owner} chars={6} showCopy={false} />
              </Link>
              <CreatorScoreInline address={balance.owner} size="sm" />
            </div>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              × {balance.amount}
            </span>
          </div>
        ))}
        {total > MAX_VISIBLE ? (
          <p className="text-xs text-muted-foreground/60">
            +{plural(total - MAX_VISIBLE, "more owner")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
