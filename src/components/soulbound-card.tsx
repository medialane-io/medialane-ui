"use client";

import Image from "next/image";
import { Lock } from "lucide-react";
import type { ApiActivity } from "@medialane/sdk";
import { BRAND_GRADIENT } from "../data/brand.js";
import { AddressDisplay } from "./address-display.js";
import Link from "./link.js";

export function issuedAt(history: readonly ApiActivity[]): string | null {
  const times = history
    .filter((event) => event.type === "mint")
    .map((event) => new Date(event.timestamp).getTime())
    .filter((time) => Number.isFinite(time));
  if (times.length === 0) return null;
  return new Date(Math.min(...times)).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export interface SoulboundCardProps {
  image?: string | null;
  ownerAddress?: string | null;
  ownerHref?: string;
  history?: readonly ApiActivity[];
}

export function SoulboundCard({ image, ownerAddress, ownerHref, history = [] }: SoulboundCardProps) {
  const issued = issuedAt(history);
  return (
    <section aria-label="Soulbound asset" className="rounded-2xl p-px" style={{ background: BRAND_GRADIENT }}>
      <div className="space-y-4 rounded-[15px] bg-card p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Soulbound asset</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Permanently linked to the wallet it was issued to, verifiable on-chain.</p>
        </div>

        {ownerAddress ? (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
              {image ? <Image src={image} alt="" fill className="object-cover" unoptimized /> : null}
            </div>
            <div className="relative h-px min-w-6 flex-1" style={{ background: BRAND_GRADIENT }}>
              <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-[0_0_18px_hsl(var(--brand-purple)/0.45)] animate-pulse-glow">
                <Lock className="h-3.5 w-3.5 text-brand-purple" />
              </span>
            </div>
            {ownerHref ? (
              <Link href={ownerHref} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:text-primary">
                <AddressDisplay address={ownerAddress} />
              </Link>
            ) : (
              <span className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                <AddressDisplay address={ownerAddress} />
              </span>
            )}
          </div>
        ) : null}

        {issued ? <p className="text-2xs text-muted-foreground">Issued {issued}</p> : null}
      </div>
    </section>
  );
}
