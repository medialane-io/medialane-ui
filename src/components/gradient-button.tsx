"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils/cn.js";

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  big?: boolean;
  asChild?: boolean;
  wrapperClassName?: string;
}

export function GradientButton({ big, asChild, children, className, wrapperClassName, disabled, ...rest }: GradientButtonProps) {
  const sizeClass = big
    ? "h-[54px] px-5 rounded-[15px] text-base"
    : "h-12 px-5 rounded-[11px] text-sm";
  const Comp = asChild ? Slot : "button";

  return (
    <div
      className={cn(
        "btn-border-animated w-full p-[1px]",
        big ? "rounded-2xl" : "rounded-xl",
        disabled && "pointer-events-none",
        wrapperClassName,
      )}
    >
      <Comp
        {...rest}
        disabled={disabled}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap font-semibold text-white",
          "border-none bg-transparent transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60",
          sizeClass,
          className,
        )}
      >
        {children}
      </Comp>
    </div>
  );
}
