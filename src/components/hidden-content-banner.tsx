"use client";

import { AlertTriangle } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { Panel } from "./panel.js";

export function HiddenContentBanner() {
  const t = useT();
  return (
    <Panel tone={["rose", "orange"]} className="w-full px-4 py-3 flex items-start gap-3 mb-6">
      <AlertTriangle className="w-4 h-4 text-brand-rose mt-0.5 shrink-0" />
      <p className="text-sm text-foreground leading-relaxed">
        {t("This content is not public visible on Medialane. For more information you can request support.")}
      </p>
    </Panel>
  );
}
