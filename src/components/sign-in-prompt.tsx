"use client";

import type { ReactNode } from "react";
import { Button } from "./button.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useT } from "../i18n/provider.js";

export function SignInPrompt({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  const t = useT();
  const { onRequireWallet, connectLabel } = useMedialaneApp();
  return (
    <div className="panel relative overflow-hidden space-y-4 p-10 text-center">
      {icon ? <div className="flex justify-center">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {text ? <p className="text-xs text-muted-foreground">{text}</p> : null}
      </div>
      <Button size="sm" className="rounded-full px-5" onClick={onRequireWallet}>
        {connectLabel ?? t("Sign in")}
      </Button>
    </div>
  );
}
