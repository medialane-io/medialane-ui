"use client";

import Link from "./link.js";
import { assetHref } from "@medialane/sdk";
import { GitBranch } from "lucide-react";
import { useTokenRemixes } from "../utils/use-remix-offers.js";
import { Skeleton } from "./skeleton.js";
import { useT } from "../i18n/provider.js";

export interface RemixesTabProps {
  contractAddress: string;
  tokenId: string;
}

export function RemixesTab({ contractAddress, tokenId }: RemixesTabProps) {
  const t = useT();
  const { remixes, total, isLoading } = useTokenRemixes(contractAddress, tokenId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (remixes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <GitBranch className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium">{t("No remixes yet")}</p>
        <p className="text-xs text-muted-foreground">{t("Remix this asset to create the first derivative work.")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t.plural("{count} remix of this asset", "{count} remixes of this asset", total)}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {remixes.map((remix) =>
          remix.remixContract && remix.remixTokenId ? (
            <Link
              key={remix.id}
              href={assetHref("STARKNET", remix.remixContract, remix.remixTokenId)}
              className="group relative block"
            >
              <div className="panel overflow-hidden p-3 space-y-1 transition-colors hover:bg-background/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GitBranch className="h-3 w-3 text-primary" />
                  <span className="text-primary font-medium">{t("Remix")}</span>
                </div>
                <p className="text-2xs text-muted-foreground">{remix.licenseType}</p>
                <div className="flex gap-1 flex-wrap">
                  {remix.commercial && (
                    <span className="text-2xs px-1.5 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue">{t("Commercial")}</span>
                  )}
                  {remix.derivatives && (
                    <span className="text-2xs px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{t("Derivatives")}</span>
                  )}
                </div>
              </div>
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}
