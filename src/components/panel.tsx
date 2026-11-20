import * as React from "react";
import { cn } from "../utils/cn.js";
import { BRAND } from "../data/brand.js";

export type PanelColor = keyof typeof BRAND;

/** "neutral", one brand colour, or a pair blended from the first into the second. */
export type PanelTone = "neutral" | PanelColor | readonly [PanelColor, PanelColor];

const stop = (color: PanelColor, alpha: number) => `hsl(var(--brand-${color}) / ${alpha})`;

/** Background for a brand-coloured panel: one brand colour, or a pair blended from the first into the second. */
export function panelBackground(tone: Exclude<PanelTone, "neutral">): string {
  if (typeof tone === "string") return `linear-gradient(to bottom right, ${stop(tone, 0.32)}, transparent)`;
  const [from, to] = tone;
  return `linear-gradient(to bottom right, ${stop(from, 0.32)}, ${stop(to, 0.16)}, transparent)`;
}

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ tone = "neutral", className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("panel", className)}
      style={tone === "neutral" ? style : { backgroundImage: panelBackground(tone), ...style }}
      {...props}
    />
  ),
);
Panel.displayName = "Panel";

/** Surface for controls and chips that sit on a panel. */
export const PANEL_INSET = "bg-background/40 hover:bg-background/70 transition-colors";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Brand colour for the text and icon; muted text when omitted. */
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
