"use client";

import { Mail, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface EmailVerificationGateProps {
  reason: string;
  settingsHref: string;
  className?: string;
}

const BRAND_LOOP = "linear-gradient(270deg, #3b7bff, #8a5cf6, #f6608f, #fb8b46, #3b7bff)";

export function EmailVerificationGate({
  reason,
  settingsHref,
  className,
}: EmailVerificationGateProps) {
  return (
    <div className={cn("col-span-2 mb-3 space-y-1.5", className)}>
      <a
        href={settingsHref}
        className="ml-gbtn flex h-[54px] items-center gap-3 rounded-[13px] bg-transparent px-5 font-semibold transition-transform active:scale-[0.99]"
        style={{ '--ml-grad': BRAND_LOOP } as React.CSSProperties}
      >
        <Mail className="h-4 w-4 shrink-0 text-brand-orange" />
        <span className="min-w-0 flex-1 truncate text-left text-base">Verify email to {reason}</span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>
      <p className="px-1 text-xs text-muted-foreground">Takes under a minute</p>
    </div>
  );
}
