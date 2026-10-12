"use client";

import type { ApiDropMint } from "@medialane/sdk";
import { AddressDisplay } from "../../address-display.js";
import { timeAgo } from "../../../utils/time.js";

export function DropActivityList({ mints }: { mints: ApiDropMint[] }) {
  if (mints.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No mints yet.</p>;
  return (
    <ul className="divide-y divide-border/60">
      {mints.map((m) => (
        <li key={`${m.txHash}-${m.firstTokenId}`} className="flex items-center justify-between gap-3 py-3 text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <AddressDisplay address={m.wallet} chars={4} showCopy={false} />
            <span className="text-muted-foreground">{m.kind === "claim" ? `minted ${m.quantity}` : `received ${m.quantity} as a gift`}</span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(m.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
