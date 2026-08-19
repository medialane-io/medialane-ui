"use client";

import { Mail } from "lucide-react";
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
    <a
      href={settingsHref}
      className={cn(
        "ml-gbtn col-span-2 mb-3 flex h-[54px] items-center justify-center gap-2 rounded-[13px] bg-transparent px-5 font-semibold transition-transform active:scale-[0.99]",
        className,
      )}
      style={{ '--ml-grad': BRAND_LOOP } as React.CSSProperties}
    >
      <Mail className="h-4 w-4 shrink-0 text-brand-orange" />
      <span className="truncate text-base">Verify email to {reason}</span>
    </a>
  );
}
