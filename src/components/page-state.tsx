import type { ElementType, ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { Skeleton } from "./skeleton.js";

export interface PageStateProps {
  icon?: ElementType;
  iconClassName?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const frame = "mx-auto max-w-lg space-y-4 px-4 pb-8 pt-24";

export function PageState({ icon: Icon, iconClassName, title, description, children, className }: PageStateProps) {
  return (
    <div className={cn(frame, "text-center", className)}>
      {Icon && <Icon className={cn("mx-auto h-10 w-10 text-muted-foreground", iconClassName)} />}
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}

export function PageStateSkeleton({ action = false, className }: { action?: boolean; className?: string }) {
  return (
    <div className={cn(frame, className)}>
      <Skeleton className="mx-auto h-10 w-10 rounded-full" />
      <Skeleton className="mx-auto h-7 w-56" />
      <Skeleton className="mx-auto h-4 w-72" />
      {action && <Skeleton className="mx-auto h-10 w-44 rounded-xl" />}
    </div>
  );
}
