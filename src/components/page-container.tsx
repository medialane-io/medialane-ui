import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn.js";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the page width contract.
   * - app: full available canvas for sidebar/dashboard shells.
   * - content: standard editorial max width.
   * - narrow: focused forms and legal/content pages.
   */
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
        // Horizontal padding matches the fixed NavTrigger logo offset
        // (left-4 sm:left-6 lg:left-8) so page content aligns with the
        // logo at every breakpoint. Keep this responsive, not a flat px.
        "px-4 sm:px-6 lg:px-8 pt-10 pb-16",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
