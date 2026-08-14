"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioBentoTileProps {

  title: string;

  href: string;

  size?: "wide" | "default";
  children: React.ReactNode;
  className?: string;
}

export function PortfolioBentoTile({
  title,
  href,
  size = "default",
  children,
  className,
}: PortfolioBentoTileProps) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-foreground/[0.04] min-w-0 transition-colors hover:bg-foreground/[0.07]",
        size === "wide" && "md:col-span-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <h2 className="text-sm font-black text-foreground tracking-tight">
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          See all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}
