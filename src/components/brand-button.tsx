"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils/cn.js";

const SIZES = {
  md: { border: "rounded-xl", inner: "h-11 rounded-[11px] text-sm" },
  lg: { border: "rounded-2xl", inner: "h-12 rounded-[15px] text-base" },
} as const;

export interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: keyof typeof SIZES;
  asChild?: boolean;
  borderClassName?: string;
}

export const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ size = "md", asChild = false, className, borderClassName, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <div className={cn("btn-border-animated p-[1px]", SIZES[size].border, disabled && "pointer-events-none", borderClassName)}>
        <Comp
          ref={ref}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-center gap-2 bg-transparent font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60",
            SIZES[size].inner,
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
      </div>
    );
  },
);
BrandButton.displayName = "BrandButton";
