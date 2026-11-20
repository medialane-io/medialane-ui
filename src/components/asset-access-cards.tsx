"use client";

import { useT } from "../i18n/provider.js";
import { assetHref, type Chain } from "@medialane/sdk";
import { Wallet } from "lucide-react";
import { useMedialaneApp, type AssetRef } from "./medialane-app.js";
import { ActionButton } from "./action-button.js";
import { Button } from "./button.js";
import { cn } from "../utils/cn.js";
import { PANEL_INSET } from "./panel.js";

export function CompanionAppButton({ asset, variant = "button" }: { asset: AssetRef; variant?: "button" | "link" }) {
  const { companion } = useMedialaneApp();
  if (!companion) return null;
  const Icon = companion.icon;
  const href = `${companion.origin}${assetHref(asset.chain.toUpperCase() as Chain, asset.contractAddress, asset.tokenId)}`;
  if (variant === "link") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={companion.description}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon className="h-4 w-4" />
        {companion.title}
      </a>
    );
  }
  return (
    <Button asChild variant="ghost" className={cn("h-[46px] w-full rounded-xl font-semibold sm:w-auto sm:min-w-36", PANEL_INSET)}>
      <a href={href} target="_blank" rel="noopener noreferrer" title={companion.description}>
        <Icon className="h-4 w-4" />
        {companion.title}
      </a>
    </Button>
  );
}

export function AssetAccessButtons({ asset, stacked = false }: { asset: AssetRef; stacked?: boolean }) {
  const t = useT();
  const { onRequireWallet, connectLabel = "Sign in" } = useMedialaneApp();
  return (
    <div className={cn("grid grid-cols-1 gap-2", !stacked && "sm:flex sm:flex-wrap")}>
      <ActionButton action="buy" icon={<Wallet className="h-4 w-4" />} onClick={onRequireWallet} className={cn("w-full", !stacked && "sm:w-auto sm:min-w-36")}>
        {t(connectLabel)}
      </ActionButton>
      <CompanionAppButton asset={asset} />
    </div>
  );
}
