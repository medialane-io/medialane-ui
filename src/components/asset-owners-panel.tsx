"use client";

import Link from "./link.js";
import { AddressDisplay } from "./address-display.js";
import { CreatorScoreInline } from "./creator-score-inline.js";
import { useMedialaneApp } from "../utils/app.js";

interface HolderLike {
  owner: string;
  amount: string;
}

interface AssetOwnersPanelProps {
  balances: HolderLike[];
  total?: number;
  ownerLabel?: string;
  maxVisible?: number;
  showAmount?: boolean;
}

export function AssetOwnersPanel({
  balances,
  total = balances.length,
  ownerLabel,
  maxVisible = 5,
  showAmount = true,
}: AssetOwnersPanelProps) {
  const { getClient } = useMedialaneApp();
  if (balances.length === 0) return null;

  const label = ownerLabel ?? (total === 1 ? "Owner" : `${total} owners`);

  return (
    <div className="rounded-xl border border-border px-4 py-3 space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {balances.slice(0, maxVisible).map((balance) => (
          <div key={balance.owner} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Link
                href={`/creator/${balance.owner}`}
                className="hover:text-primary transition-colors font-medium text-sm truncate"
              >
                <AddressDisplay address={balance.owner} chars={6} showCopy={false} />
              </Link>
              <CreatorScoreInline getClient={getClient} address={balance.owner} size="sm" />
            </div>
            {showAmount ? (
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                × {balance.amount}
              </span>
            ) : null}
          </div>
        ))}
        {total > maxVisible ? (
          <p className="text-xs text-muted-foreground/60">
            +{total - maxVisible} more holders
          </p>
        ) : null}
      </div>
    </div>
  );
}
