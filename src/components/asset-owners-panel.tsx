"use client";

import { useEffect, useState } from "react";
import Link from "./link.js";
import { AddressDisplay } from "./address-display.js";
import { CreatorScoreInline } from "./creator-score-inline.js";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";
import { useTokenOwners } from "../utils/use-tokens.js";

interface HolderLike {
  owner: string;
  amount: string;
}

interface AssetOwnersPanelProps {
  contract: string;
  tokenId: string;
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
        <Link href={`/creator/${owner}`} className="hover:text-primary transition-colors font-medium text-sm truncate">
          <AddressDisplay address={owner} chars={6} showCopy={false} />
        </Link>
        <CreatorScoreInline address={owner} size="sm" />
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">× {amount}</span>
    </div>
  );
}

function AssetOwnersDialog({ contract, tokenId, title, open, onOpenChange }: { contract: string; tokenId: string; title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [page, setPage] = useState(1);
  const [owners, setOwners] = useState<HolderLike[]>([]);
  const { owners: pageOwners, total, isLoading } = useTokenOwners(open ? contract : null, tokenId, page);

  useEffect(() => {
    if (pageOwners.length === 0) return;
    setOwners((prev) => (page === 1 ? pageOwners : [...prev, ...pageOwners.filter((o) => !prev.some((p) => p.owner === o.owner))]));
  }, [pageOwners, page]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 overflow-hidden gap-0 flex flex-col max-h-[85svh]">
        <div className="px-5 py-4 border-b border-border/60 shrink-0">
          <DialogTitle className="text-base font-bold tabular-nums">{title}</DialogTitle>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
          {owners.map((o) => <OwnerRow key={o.owner} {...o} />)}
          {isLoading ? <p className="text-xs text-muted-foreground">Loading owners…</p> : null}
          {!isLoading && owners.length < total ? (
            <button type="button" onClick={() => setPage((p) => p + 1)} className="mt-2 self-center text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
              Show more
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AssetOwnersPanel({ contract, tokenId, balances, total = balances.length, editions }: AssetOwnersPanelProps) {
  const [open, setOpen] = useState(false);
  if (balances.length === 0) return null;

  const owners = plural(total, "owner");
  const label = editions ? `${plural(editions, "edition")} · ${owners}` : owners;

  return (
    <div className="rounded-xl border border-border px-4 py-3 space-y-2">
      <p className="text-2xs font-semibold text-muted-foreground tabular-nums">{label}</p>
      <div className="flex flex-col gap-1.5">
        {balances.slice(0, MAX_VISIBLE).map((balance) => <OwnerRow key={balance.owner} {...balance} />)}
        {total > MAX_VISIBLE ? (
          <button type="button" onClick={() => setOpen(true)} className="self-start text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
            +{plural(total - MAX_VISIBLE, "more owner")}
          </button>
        ) : null}
      </div>
      <AssetOwnersDialog contract={contract} tokenId={tokenId} title={owners} open={open} onOpenChange={setOpen} />
    </div>
  );
}
