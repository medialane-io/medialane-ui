"use client";

import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface EmailVerificationGateProps {
  required: boolean;
  reason: string;
  settingsHref: string;
  children: ReactNode;
  className?: string;
}

export function EmailVerificationGate({
  required,
  reason,
  settingsHref,
  children,
  className,
}: EmailVerificationGateProps) {
  if (!required) return <>{children}</>;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="pointer-events-none opacity-50">{children}</div>
      <p className="text-xs text-muted-foreground">
        Verify your email to {reason} —{" "}
        <a href={settingsHref} className="pointer-events-auto underline hover:text-foreground">
          go to Settings
        </a>
      </p>
    </div>
  );
}
