"use client";

import { AlertTriangle } from "lucide-react";
import { useT } from "../i18n/provider.js";

export function HiddenContentBanner() {
  const t = useT();
  return (
    <div className="w-full bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 flex items-start gap-3 mb-6">
      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
      <p className="text-sm text-destructive leading-relaxed">
        {t("This content is not public visible on Medialane. For more information you can request support.")}
      </p>
    </div>
  );
}
