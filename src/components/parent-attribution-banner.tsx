"use client";

import Link from "./link.js";
import { GitBranch, ExternalLink } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { panelTint } from "./panel.js";

export interface ParentBannerProps {
  parentContract: string;
  parentTokenId: string;
  parentName?: string;
}

export function ParentAttributionBanner({ parentContract, parentTokenId, parentName }: ParentBannerProps) {
  const t = useT();
  return (
    <Link
      href={`/asset/${parentContract}/${parentTokenId}`}
      className="panel flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-background/40 transition-colors group"
      style={panelTint("blue")}
    >
      <GitBranch className="h-4 w-4 text-primary shrink-0" />
      <span className="text-muted-foreground">{t("Remix of")}</span>
      <span className="font-medium text-foreground truncate">{parentName ?? `Token #${parentTokenId}`}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 group-hover:text-foreground transition-colors" />
    </Link>
  );
}
