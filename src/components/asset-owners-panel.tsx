"use client";

import Link from "./link.js";
import { AddressDisplay } from "./address-display.js";
import { profileHref } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";

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

function OwnerRow({ owner, amount }: HolderLike) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Link href={profileHref({ address: owner })} className="hover:text-primary transition-colors font-medium text-sm truncate">
          <AddressDisplay address={owner} chars={6} showCopy={false} />
        </Link>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">× {amount}</span>
    </div>
  );
}

export function AssetOwnersPanel({ balances, total = balances.length, editions }: AssetOwnersPanelProps) {
  const t = useT();
  const intl = useFormat();
  if (balances.length === 0) return null;

  const owners = t.plural("{count} owner", "{count} owners", total, { count: intl.number(total) });
  const label = editions && editions !== total ? `${t.plural("{count} edition", "{count} editions", editions, { count: intl.number(editions) })} · ${owners}` : owners;

  return (
    <div className="rounded-xl border border-border px-4 py-3 space-y-2">
      <p className="text-2xs font-semibold text-muted-foreground tabular-nums">{label}</p>
      <div className="flex flex-col gap-1.5">
        {balances.slice(0, MAX_VISIBLE).map((balance) => <OwnerRow key={balance.owner} {...balance} />)}
        {total > MAX_VISIBLE ? (
          <p className="text-xs text-muted-foreground/60">+{t.plural("{count} more owner", "{count} more owners", total - MAX_VISIBLE, { count: intl.number(total - MAX_VISIBLE) })}</p>
        ) : null}
      </div>
    </div>
  );
}
