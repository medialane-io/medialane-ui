"use client";

import { cn } from "../utils/cn.js";

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tall 54px variant for hero contexts (onboarding, primary page CTAs). */
  big?: boolean;
  /** Outer wrapper class (the `.btn-border-animated` ring) — rarely needed. */
  wrapperClassName?: string;
}

/**
 * The full-spectrum animated-gradient CTA — `.btn-border-animated` as a 1px
 * wrapper around a transparent-fill button, so the ring reads as a solid,
 * continuously shifting brand-gradient fill (blue → purple → rose → orange).
 * This is the primary-action treatment used across medialane.io/starknet.medialane.io
 * (e.g. "Connect wallet", "Buy now") — previously hand-copied per call site;
 * this component is the single source.
 *
 * For the secondary animated-border treatment (transparent fill, only the
 * per-action gradient border and colored icon/text), use `ActionButton` instead.
 */
export function GradientButton({ big, children, className, wrapperClassName, ...rest }: GradientButtonProps) {
  const sizeClass = big
    ? "h-[54px] px-5 rounded-[15px] text-[15px]"
    : "h-12 px-5 rounded-[11px] text-sm";

  return (
    <div className={cn("btn-border-animated w-full p-[1px]", big ? "rounded-2xl" : "rounded-xl", wrapperClassName)}>
      <button
        {...rest}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap font-semibold text-white",
          "border-none bg-transparent transition-all hover:brightness-110 active:scale-[0.98]",
          sizeClass,
          className,
        )}
      >
        {children}
      </button>
    </div>
  );
}
