"use client";

import { cn } from "../utils/cn.js";
import { HelpIcon } from "./help-icon.js";
import { ACTION_FOREGROUNDS, ACTION_GRADIENTS, TONE_FOREGROUNDS, TONE_GRADIENTS } from "../data/brand.js";

export type ActionKey = keyof typeof ACTION_GRADIENTS;
export type ToneKey = keyof typeof TONE_GRADIENTS;

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  action?: ActionKey;

  tone?: ToneKey;
  icon?: React.ReactNode;

  big?: boolean;

  ghost?: boolean;

  helpContent?: string;
}

export function ActionButton({
  action,
  tone,
  icon,
  big,
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

  const gradColors =
    action ? ACTION_GRADIENTS[action] :
    tone   ? TONE_GRADIENTS[tone] :
    ACTION_GRADIENTS.buy;

  const fg =
    action ? ACTION_FOREGROUNDS[action] :
    tone   ? TONE_FOREGROUNDS[tone] :
    ACTION_FOREGROUNDS.buy;

  const grad = `linear-gradient(115deg, ${gradColors.join(',')})`;

  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        "ml-gbtn inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap",
        "bg-transparent text-foreground border-none relative disabled:opacity-40 disabled:pointer-events-none",
        sizeClass,
        className,
      )}
      style={{ '--ml-grad': grad, ...style } as React.CSSProperties}
    >
      {icon && <span className="inline-flex" style={{ color: fg }}>{icon}</span>}
      {children}
      {helpContent ? <HelpIcon content={helpContent} /> : null}
    </button>
  );
}
