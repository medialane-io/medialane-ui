import type { ElementType } from "react";
import { IconTile } from "./icon-tile.js";

export interface TabEmptyStateProps {
  icon: ElementType;
  heading: string;
  body: string;
}

export function TabEmptyState({ icon: Icon, heading, body }: TabEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <IconTile size="lg">
        <Icon />
      </IconTile>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold">{heading}</p>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
