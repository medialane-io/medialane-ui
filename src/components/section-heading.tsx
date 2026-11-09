"use client";

import Link from "./link.js";
import { ArrowRight } from "lucide-react";

export interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  href: string;
  linkLabel?: string;
}

export function SectionHeading({ icon, title, subtitle, href, linkLabel = "See all" }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-none tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 flex items-center gap-1 text-2xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {linkLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
