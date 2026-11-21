import * as React from "react";
import { cn } from "../utils/cn.js";
import { BRAND } from "../data/brand.js";

export type PanelColor = keyof typeof BRAND;

export function panelTint(color: PanelColor): React.CSSProperties {
  return { background: `hsl(var(--brand-${color}) / 0.12)` };
}

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PanelColor;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ tone, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("panel", className)}
      style={tone ? { ...panelTint(tone), ...style } : style}
      {...props}
    />
  ),
);
Panel.displayName = "Panel";

export const PANEL_INSET = "bg-background/40 hover:bg-background/70 transition-colors";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: PanelColor;
}

export function Pill({ color, className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "pill",
        color ? BRAND[color].text : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
