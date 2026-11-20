"use client";

import { cn } from "../utils/cn.js";
import { HelpIcon } from "./help-icon.js";
import { ACTION_FOREGROUNDS, ACTION_PAIRS, TONE_FOREGROUNDS, TONE_PAIRS, brandTint } from "../data/brand.js";

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
  disabled,
  children,
  className,
  style,
  ...rest
}: ActionButtonProps) {
  const sizeClass = big
    ? "h-[54px] px-5 rounded-[13px] text-base"
    : small
    ? "h-9 px-3 rounded-xl text-xs"
    : "h-[46px] px-5 rounded-[13px] text-sm";

  if (ghost) {
    return (
      <button
        {...rest}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap",
          "bg-muted text-foreground border-none disabled:opacity-50 disabled:pointer-events-none",
          sizeClass,
          className,
        )}
        style={style}
      >
        {icon}{children}
        {helpContent ? <HelpIcon content={helpContent} /> : null}
      </button>
    );
  }

  const [from, to] =
    action ? ACTION_PAIRS[action] :
    tone   ? TONE_PAIRS[tone] :
    ACTION_PAIRS.buy;

  const fg =
    action ? ACTION_FOREGROUNDS[action] :
    tone   ? TONE_FOREGROUNDS[tone] :
    ACTION_FOREGROUNDS.buy;

  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap",
        solid ? "text-white" : "text-foreground",
        "border-none transition-[filter] hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none",
        sizeClass,
        className,
      )}
      style={{ backgroundImage: `linear-gradient(115deg, ${brandTint(from, solid ? 1 : 0.28)}, ${brandTint(to, solid ? 1 : 0.16)})`, ...style }}
    >
      {icon && <span className="inline-flex" style={solid ? undefined : { color: fg }}>{icon}</span>}
      {children}
      {helpContent ? <HelpIcon content={helpContent} /> : null}
    </button>
  );
}
