import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface ServiceHeaderProps {

  icon: ReactNode;
  title: string;
  subtitle?: string;

  headerAccessory?: ReactNode;
  className?: string;

  plain?: boolean;

  bare?: boolean;
}

export function ServiceHeader({ icon, title, subtitle, headerAccessory, className, plain = false, bare = false }: ServiceHeaderProps) {
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">{subtitle}</p>}
      {headerAccessory && <div className="mt-4">{headerAccessory}</div>}
    </>
  );

  if (bare) {
    return <div className={className}>{body}</div>;
  }

  if (plain) {
    return <div className={cn("panel p-6 sm:p-7", className)}>{body}</div>;
  }

  return (
    <div className={cn("rounded-2xl bg-card p-6 sm:p-7", className)}>{body}</div>
  );
}
