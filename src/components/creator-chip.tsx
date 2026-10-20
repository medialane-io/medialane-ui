"use client";

import Link from "./link.js";
import { useCreatorProfile } from "../utils/use-profiles.js";
import { AddressDisplay } from "./address-display.js";
import { profileHref } from "@medialane/sdk";

export interface CreatorChipProps {
  address: string;
}

export function CreatorChip({ address }: CreatorChipProps) {
  const { profile } = useCreatorProfile(address);
  const label = profile?.name || profile?.username || null;

  return (
    <Link
      href={profileHref({ address })}
      className="inline-flex items-center gap-1.5 text-sm rounded-full px-2 py-1 hover:bg-muted/60 active:scale-[0.98] transition"
    >
      <span className="text-muted-foreground shrink-0">by</span>
      {label ? (
        <span className="font-semibold text-foreground truncate">{label}</span>
      ) : (
        <AddressDisplay address={address} chars={6} showCopy={false} className="font-semibold text-foreground" />
      )}
    </Link>
  );
}
