"use client";

import { ArrowRight, Package } from "lucide-react";
import { dropHref } from "@medialane/sdk";
import Link from "../link.js";

/** On a token page: where the token was minted. */
export function DropTokenLink({ contract, name }: { contract: string; name: string | null }) {
  return (
    <Link
      href={dropHref(contract)}
      className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <span className="flex min-w-0 items-center gap-2 text-sm">
        <Package className="h-4 w-4 shrink-0 text-brand-orange" />
        <span className="text-muted-foreground">From the drop</span>
        <span className="truncate font-semibold">{name ?? "Drop"}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
        View drop <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
