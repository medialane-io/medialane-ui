"use client";

import { ExternalLink, Flag } from "lucide-react";
import { ShareButton } from "./share-button.js";

export interface AssetUtilityIconsProps {
  contractExplorerHref: string;
  shareTitle: string;
  onReportClick: () => void;
}

/**
 * Asset-level utility row: view-on-explorer / share / report. Lives next to
 * the asset's own identity (name/owner), not inside `AssetCollectionBar` —
 * these actions are about the asset, not the collection it belongs to.
 */
export function AssetUtilityIcons({
  contractExplorerHref,
  shareTitle,
  onReportClick,
}: AssetUtilityIconsProps) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <a
        href={contractExplorerHref}
        target="_blank"
        rel="noopener noreferrer"
        title="View contract"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
      <ShareButton title={shareTitle} variant="ghost" size="icon" />
      <button
        type="button"
        title="Report this asset"
        onClick={onReportClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <Flag className="h-4 w-4" />
      </button>
    </div>
  );
}
