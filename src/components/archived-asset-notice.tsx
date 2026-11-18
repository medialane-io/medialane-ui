"use client";

import { Archive } from "lucide-react";
import { useT } from "../i18n/provider.js";

export function ArchivedAssetNotice() {
  const t = useT();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <Archive className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">{t("Permanently archived")}</p>
        <p className="text-xs text-muted-foreground">
          {t("This asset's record stays onchain with its owner, creator and history. It can no longer be transferred or sold.")}
        </p>
      </div>
    </div>
  );
}
