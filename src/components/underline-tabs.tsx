"use client";

import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { LucideIcon } from "lucide-react";

export interface UnderlineTab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export interface UnderlineTabsProps {
  tabs: ReadonlyArray<UnderlineTab>;
  value: string;
  onValueChange: (id: string) => void;
  trailing?: ReactNode;
  children: ReactNode;
}

export function UnderlineTabs({ tabs, value, onValueChange, trailing, children }: UnderlineTabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
      <div className="sticky top-0 z-20 mt-4 flex items-center gap-2 bg-background/95 px-6 backdrop-blur-sm">
        <TabsPrimitive.List className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <TabsPrimitive.Trigger
              key={id}
              value={id}
              className="group relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {count ? (
                <span className="min-w-[18px] rounded-full bg-muted px-1.5 py-px text-center text-2xs font-bold tabular-nums text-muted-foreground group-data-[state=active]:bg-primary/15 group-data-[state=active]:text-primary">{count}</span>
              ) : null}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {trailing}
      </div>
      {children}
    </TabsPrimitive.Root>
  );
}
