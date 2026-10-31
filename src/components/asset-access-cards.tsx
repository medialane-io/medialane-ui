"use client";

import { assetHref, type Chain } from "@medialane/sdk";
import { Wallet } from "lucide-react";
import { useMedialaneApp, type AssetRef } from "./medialane-app.js";
import { ActionButton } from "./action-button.js";
import { Button } from "./button.js";
import { cn } from "../utils/cn.js";

export function CompanionAppButton({ asset }: { asset: AssetRef }) {
  const { companion } = useMedialaneApp();
  if (!companion) return null;
  const Icon = companion.icon;
  return (
    <Button asChild variant="outline" className="h-[46px] w-full rounded-[13px] bg-transparent font-semibold">
      <a
        href={`${companion.origin}${assetHref(asset.chain.toUpperCase() as Chain, asset.contractAddress, asset.tokenId)}`}
        target="_blank"
        rel="noopener noreferrer"
        title={companion.description}
      >
        <Icon className="h-4 w-4" />
        {companion.title}
      </a>
    </Button>
  );
}

export function AssetAccessButtons({ asset, stacked = false }: { asset: AssetRef; stacked?: boolean }) {
  const { onRequireWallet, connectLabel = "Sign in", companion } = useMedialaneApp();
  return (
    <div className={cn("grid grid-cols-1 gap-2", companion && !stacked && "sm:grid-cols-2")}>
      <ActionButton action="buy" icon={<Wallet className="h-4 w-4" />} onClick={onRequireWallet} className="w-full">
        {connectLabel}
      </ActionButton>
      <CompanionAppButton asset={asset} />
    </div>
  );
}
