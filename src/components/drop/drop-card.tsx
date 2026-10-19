"use client";

import { dropHref, type ApiDrop } from "@medialane/sdk";
import Image from "../image.js";
import Link from "../link.js";
import { DropStatusBadge } from "./drop-status.js";
import { ipfsToHttp } from "../../utils/ipfs.js";
import { dropPhase } from "../../utils/drop/view.js";
import { priceLabel, supplyLabel } from "../../utils/drop/sale.js";

export interface DropCardProps {
  drop: ApiDrop;
  now: number;
  /** Organizer view: links to the Manage tab. */
  manage?: boolean;
}

export function DropCard({ drop, now, manage }: DropCardProps) {
  const phase = dropPhase(drop.terms, BigInt(drop.maxSupply), BigInt(drop.minted), now);
  return (
    <Link
      href={`${dropHref(drop.contractAddress)}${manage ? "?tab=manage" : ""}`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-square bg-muted">
        {drop.image && (
          <Image src={ipfsToHttp(drop.image)} alt={drop.name ?? "Drop"} fill unoptimized className="object-cover transition-transform group-hover:scale-[1.02]" />
        )}
        <div className="absolute left-3 top-3"><DropStatusBadge phase={phase} /></div>
      </div>
      <div className="space-y-1 p-4">
        <p className="truncate font-semibold">{drop.name ?? "Untitled drop"}</p>
        <div className="flex justify-between gap-2 text-xs text-muted-foreground">
          <span>{priceLabel(drop.terms.price, drop.terms.paymentToken)}</span>
          <span>{supplyLabel(drop.minted, drop.maxSupply)}</span>
        </div>
        {manage && <p className="pt-1 text-xs font-semibold text-primary">Manage</p>}
      </div>
    </Link>
  );
}

export function DropGrid({ drops, now, manage }: { drops: ApiDrop[]; now: number; manage?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {drops.map((d) => <DropCard key={d.contractAddress} drop={d} now={now} manage={manage} />)}
    </div>
  );
}

export function DropGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
