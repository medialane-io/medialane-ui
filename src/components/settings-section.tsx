"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { IconTile } from "./icon-tile.js";

export function SectionCard({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn("panel p-5 space-y-4", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: ElementType;
  title: string;
  description?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <IconTile size="sm" className="mt-0.5">
        <Icon />
      </IconTile>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {badge}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

export function HelperText({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>;
}
