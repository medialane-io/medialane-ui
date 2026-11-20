import * as React from "react";
import { cn } from "../utils/cn.js";

const SIZES = {
  sm: "h-8 w-8 rounded-xl text-sm [&_svg]:h-4 [&_svg]:w-4",
  md: "h-11 w-11 rounded-xl text-base [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-16 w-16 rounded-2xl text-xl [&_svg]:h-7 [&_svg]:w-7",
} as const;

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof SIZES;
  /** Red tile for errors and irreversible actions. */
  destructive?: boolean;
}

/** An icon in the logo's shape: white line icon on solid brand blue. */
export function IconTile({ size = "md", destructive, className, ...props }: IconTileProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold text-white",
        destructive ? "bg-destructive" : "bg-primary",
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
