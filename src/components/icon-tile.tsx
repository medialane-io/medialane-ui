import * as React from "react";
import { cn } from "../utils/cn.js";

const SIZES = {
  sm: "h-8 w-8 text-sm [&_svg]:h-4 [&_svg]:w-4",
  md: "h-11 w-11 text-base [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-16 w-16 text-xl [&_svg]:h-7 [&_svg]:w-7",
} as const;

const LOGO_CORNER = "rounded-[30%]";

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof SIZES;
  destructive?: boolean;
}

export function IconTile({ size = "md", destructive, className, ...props }: IconTileProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold text-white",
        destructive ? "bg-destructive" : "bg-primary",
        LOGO_CORNER,
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
