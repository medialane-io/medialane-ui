import type { ElementType } from "react";

export interface TabEmptyStateProps {
  icon: ElementType;
  heading: string;
  body: string;
}

export function TabEmptyState({ icon: Icon, heading, body }: TabEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="h-14 w-14 rounded-2xl border border-border/60 bg-muted/40 flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold">{heading}</p>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
