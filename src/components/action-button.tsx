"use client";

import { cn } from "../utils/cn.js";

const ACTION_GRADIENTS: Record<string, [string, string, string]> = {
  buy:     ['#3b7bff', '#8a5cf6', '#3b7bff'],
  submit:  ['#d6359a', '#5b4ce6', '#d6359a'],
  offer:   ['#f6608f', '#fb8b46', '#f6608f'],
  remix:   ['#8a5cf6', '#f6608f', '#8a5cf6'],
  license: ['#3b7bff', '#5b4ce6', '#3b7bff'],
};

const ACTION_FOREGROUNDS: Record<string, string> = {
  buy:     '#3b7bff',
  submit:  '#5b4ce6',
  offer:   '#fb7a32',
  remix:   '#8a3ff0',
  license: '#3b7bff',
};

const TONE_GRADIENTS: Record<string, [string, string, string]> = {
  blue:   ['#3b7bff', '#5b4ce6', '#3b7bff'],
  indigo: ['#5b4ce6', '#8a5cf6', '#5b4ce6'],
  purple: ['#8a5cf6', '#f6608f', '#8a5cf6'],
  orange: ['#fb8b46', '#f6608f', '#fb8b46'],
  red:    ['#ef5a5a', '#f6608f', '#ef5a5a'],
  rose:   ['#f6608f', '#fb8b46', '#f6608f'],
};

const TONE_FOREGROUNDS: Record<string, string> = {
  blue:   '#2f6bff',
  indigo: '#5b4ce6',
  purple: '#8a3ff0',
  orange: '#fb7a32',
  red:    '#ef5a5a',
  rose:   '#f6608f',
};

export type ActionKey = keyof typeof ACTION_GRADIENTS;
export type ToneKey = keyof typeof TONE_GRADIENTS;

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Semantic action — hue signals the action, never decorative. */
  action?: ActionKey;
  /** Tone — for secondary/owner actions. Ignored when action is set. */
  tone?: ToneKey;
  icon?: React.ReactNode;
  /** Tall 54px variant for hero contexts. */
  big?: boolean;
  /** Ghost: no gradient border, muted surface fill. */
  ghost?: boolean;
}

export function ActionButton({
  action,
  tone,
  icon,
  big,
  ghost,
  children,
  className,
  style,
  ...rest
}: ActionButtonProps) {
  const sizeClass = big
    ? "h-[54px] px-5 rounded-[13px] text-[15px]"
    : "h-[46px] px-5 rounded-[13px] text-sm";

  if (ghost) {
    return (
      <button
        {...rest}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap",
          "bg-muted text-foreground border-none",
          sizeClass,
          className,
        )}
        style={style}
      >
        {icon}{children}
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
      className={cn(
        "ml-gbtn inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap",
        "bg-card text-foreground border-none relative",
        sizeClass,
        className,
      )}
      style={{ '--ml-grad': grad, ...style } as React.CSSProperties}
    >
      {icon && <span className="inline-flex" style={{ color: fg }}>{icon}</span>}
      {children}
    </button>
  );
}
