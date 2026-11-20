"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils/cn.js";
import { HelpIcon } from "./help-icon.js";
import { ACTION_FOREGROUNDS, ACTION_PAIRS, TONE_FOREGROUNDS, TONE_PAIRS, brandTint, type BrandColorName } from "../data/brand.js";

export type ActionKey = keyof typeof ACTION_PAIRS;
export type ToneKey = keyof typeof TONE_PAIRS;

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action?: ActionKey;
  tone?: ToneKey;
  icon?: React.ReactNode;
  big?: boolean;
  /** Compact size for actions inside list rows. */
  small?: boolean;
  /** Full-strength gradient for the one primary action on a surface. */
  solid?: boolean;
  ghost?: boolean;
  helpContent?: string;
  /** Give the single child element (for example a link) the button's look. */
  asChild?: boolean;
}

/** Brand-pair gradient behind an action: soft by default, full strength when solid. */
export function actionFill([from, to]: readonly [BrandColorName, BrandColorName], solid = false): string {
  return `linear-gradient(115deg, ${brandTint(from, solid ? 1 : 0.28)}, ${brandTint(to, solid ? 1 : 0.16)})`;
}

export function ActionButton({
  action,
  tone,
  icon,
  big,
  small,
  solid,
  ghost,
  helpContent,
  asChild,
  children,
  className,
  style,
  ...rest
}: ActionButtonProps) {
  const pair = action ? ACTION_PAIRS[action] : tone ? TONE_PAIRS[tone] : ACTION_PAIRS.buy;
  const fg = action ? ACTION_FOREGROUNDS[action] : tone ? TONE_FOREGROUNDS[tone] : ACTION_FOREGROUNDS.buy;
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap border-none",
        "transition-[filter] hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none",
        ghost ? "bg-muted text-foreground" : solid ? "text-white" : "text-foreground",
        big ? "h-[54px] px-5 rounded-xl text-base" : small ? "h-9 px-3 rounded-xl text-xs" : "h-[46px] px-5 rounded-xl text-sm",
        className,
      )}
      style={ghost ? style : { backgroundImage: actionFill(pair, solid), ...style }}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon && <span className="inline-flex" style={solid || ghost ? undefined : { color: fg }}>{icon}</span>}
          {children}
          {helpContent ? <HelpIcon content={helpContent} /> : null}
        </>
      )}
    </Comp>
  );
}
