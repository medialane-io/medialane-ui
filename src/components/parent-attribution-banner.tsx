"use client";

import Link from "next/link";
import { GitBranch, ExternalLink } from "lucide-react";

export interface ParentBannerProps {
  parentContract: string;
  parentTokenId: string;
  parentName?: string;
}

/** "Remix of <parent>" attribution link shown on remix asset pages. */
export function ParentAttributionBanner({ parentContract, parentTokenId, parentName }: ParentBannerProps) {
  return (
    <Link
      href={`/asset/${parentContract}/${parentTokenId}`}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-primary/25 bg-primary/5 text-sm hover:bg-primary/10 transition-colors group"
    >
      <GitBranch className="h-4 w-4 text-primary shrink-0" />
      <span className="text-muted-foreground">Remix of</span>
      <span className="font-medium text-foreground truncate">{parentName ?? `Token #${parentTokenId}`}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 group-hover:text-foreground transition-colors" />
    </Link>
  );
}
