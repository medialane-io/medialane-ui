import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { IconTile } from "./icon-tile.js";
import { Skeleton } from "./skeleton.js";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  back?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon, back, action, children, className }: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {back}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <IconTile>{icon}</IconTile>}
          <div className="min-w-0 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="max-w-xl text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </header>
  );
}

export function PageHeaderSkeleton({ stats = 0, className }: { stats?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-9 w-64" />
      {stats > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: stats }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      )}
    </div>
  );
}
