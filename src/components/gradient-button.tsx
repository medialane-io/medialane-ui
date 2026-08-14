"use client";

import { cn } from "../utils/cn.js";

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  big?: boolean;

  wrapperClassName?: string;
}

export function GradientButton({ big, children, className, wrapperClassName, ...rest }: GradientButtonProps) {
  const sizeClass = big
    ? "h-[54px] px-5 rounded-[15px] text-base"
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
