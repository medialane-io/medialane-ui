"use client";

import type { ElementType, ReactNode } from "react";
import { IconTile } from "../icon-tile.js";

export interface AccountSectionProps {
  icon: ElementType;
  title: string;
  description: string;
  /** Red icon tile for irreversible actions. */
  destructive?: boolean;
  children: ReactNode;
}

export function AccountSection({
  icon: Icon,
  title,
  description,
  destructive,
  children,
}: AccountSectionProps) {
  return (
    <div className="panel p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <IconTile destructive={destructive}>
          <Icon />
        </IconTile>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
