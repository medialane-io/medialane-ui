"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils/cn.js";
import { HelpIcon } from "./help-icon.js";

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  big?: boolean;
  /** Compact size for actions inside cards and list rows. */
  small?: boolean;
  /** Brand blue, for the one primary action on a surface. */
  solid?: boolean;
  /** The moving brand-colour ring, for Buy. */
  ring?: boolean;
  helpContent?: string;
  /** Give the single child element (for example a link) the button's look. */
  asChild?: boolean;
}

export function ActionButton({
  icon,
  big,
  small,
  solid,
  ring,
  helpContent,
  asChild,
  children,
  className,
  ...rest
}: ActionButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-colors",
        "disabled:opacity-40 disabled:pointer-events-none",
        solid
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : ring
            ? "btn-ring text-foreground"
            : "bg-muted text-foreground hover:bg-muted/70",
        big ? "h-[54px] px-5 text-base" : small ? "h-10 px-3 text-sm" : "h-[46px] px-5 text-sm",
        className,
      )}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon}
          {children}
          {helpContent ? <HelpIcon content={helpContent} /> : null}
        </>
      )}
    </Comp>
  );
}
