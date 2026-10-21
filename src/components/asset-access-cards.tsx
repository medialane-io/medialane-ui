"use client";

import type { ElementType } from "react";
import { Wallet } from "lucide-react";
import { assetHref, type Chain } from "@medialane/sdk";
import { useMedialaneApp, type AssetRef } from "./medialane-app.js";
import { cn } from "../utils/cn.js";

const CARD = "group flex h-full w-full items-start gap-3 rounded-2xl border border-transparent p-4 text-left transition-colors";

function CardBody({ icon: Icon, iconClassName, title, description }: { icon: ElementType; iconClassName: string; title: string; description?: string }) {
  return (
    <>
      <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", iconClassName)}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-snug">{title}</p>
        {description ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
    </>
  );
}

export function CompanionAppCard({ asset }: { asset: AssetRef }) {
  const { companion } = useMedialaneApp();
  if (!companion) return null;
  return (
    <a
      href={`${companion.origin}${assetHref(asset.chain.toUpperCase() as Chain, asset.contractAddress, asset.tokenId)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(CARD, "bg-gradient-to-br from-brand-rose/15 via-brand-orange/10 to-transparent hover:border-brand-orange/30")}
    >
      <CardBody icon={companion.icon} iconClassName="from-brand-rose to-brand-orange" title={companion.title} description={companion.description} />
    </a>
  );
}

export function AssetAccessCards({ asset, stacked = false }: { asset: AssetRef; stacked?: boolean }) {
  const { onRequireWallet, connectLabel = "Sign in", connectDescription, companion } = useMedialaneApp();
  return (
    <div className={cn("grid grid-cols-1 gap-3 items-stretch", companion && !stacked && "sm:grid-cols-2")}>
      <button
        type="button"
        onClick={onRequireWallet}
        className={cn(CARD, "bg-gradient-to-br from-brand-blue/15 via-brand-purple/10 to-transparent hover:border-brand-purple/30")}
      >
        <CardBody icon={Wallet} iconClassName="from-brand-blue to-brand-purple" title={connectLabel} description={connectDescription} />
      </button>
      <CompanionAppCard asset={asset} />
    </div>
  );
}

