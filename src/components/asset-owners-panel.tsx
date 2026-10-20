"use client";

import Link from "./link.js";
import { AddressDisplay } from "./address-display.js";
import { CreatorScoreInline } from "./creator-score-inline.js";
import { profileHref } from "@medialane/sdk";

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

function OwnerRow({ owner, amount }: HolderLike) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Link href={profileHref({ address: owner })} className="hover:text-primary transition-colors font-medium text-sm truncate">
          <AddressDisplay address={owner} chars={6} showCopy={false} />
        </Link>
        <CreatorScoreInline address={owner} size="sm" />
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">× {amount}</span>
    </div>
  );
}

export function AssetOwnersPanel({ balances, total = balances.length, editions }: AssetOwnersPanelProps) {
  if (balances.length === 0) return null;

  const owners = plural(total, "owner");
  const label = editions && editions !== total ? `${plural(editions, "edition")} · ${owners}` : owners;

  return (
    <div className="rounded-xl border border-border px-4 py-3 space-y-2">
      <p className="text-2xs font-semibold text-muted-foreground tabular-nums">{label}</p>
      <div className="flex flex-col gap-1.5">
        {balances.slice(0, MAX_VISIBLE).map((balance) => <OwnerRow key={balance.owner} {...balance} />)}
        {total > MAX_VISIBLE ? (
          <p className="text-xs text-muted-foreground/60">+{plural(total - MAX_VISIBLE, "more owner")}</p>
        ) : null}
      </div>
    </div>
  );
}
