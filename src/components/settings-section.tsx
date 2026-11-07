"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "../utils/cn.js";

export function SectionCard({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn("bg-card border border-border rounded-xl p-5 space-y-4", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  badge,
  iconClass = "text-muted-foreground",
  bgClass = "bg-muted",
}: {
  icon: ElementType;
  title: string;
  description?: string;
  badge?: ReactNode;
  iconClass?: string;
  bgClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", bgClass)}>
        <Icon className={cn("h-4 w-4", iconClass)} />
      </div>
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
