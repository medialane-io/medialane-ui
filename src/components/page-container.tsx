import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn.js";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {

  variant?: "app" | "content" | "narrow" | "form";
}

const variantClass = {
  app: "w-full max-w-none",
  content: "mx-auto w-full max-w-[1400px]",
  narrow: "mx-auto w-full max-w-5xl",
  form: "mx-auto w-full max-w-2xl",
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

        "px-4 pb-16 pt-20 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
