import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn.js";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {

  variant?: "app" | "content" | "narrow";
}

const variantClass = {
  app: "w-full max-w-none",
  content: "mx-auto w-full max-w-[1400px]",
  narrow: "mx-auto w-full max-w-5xl",
};

export function PageContainer({
  variant = "app",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        variantClass[variant],

        "px-4 sm:px-6 lg:px-8 pt-10 pb-16",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
