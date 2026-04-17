"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ScrollSectionProps {
  /** Icon element rendered inside the colored badge */
  icon: React.ReactNode;
  /** Tailwind classes for the icon badge (background + shadow) */
  iconBg: string;
  title: string;
  /** "See all" link destination */
  href: string;
  /** Button label — defaults to "See all" */
  linkLabel?: string;
  /** Scroll items: wrap each in a sized snap-start div */
  children: React.ReactNode;
}

export function ScrollSection({
  icon,
  iconBg,
  title,
  href,
  linkLabel = "See all",
  children,
}: ScrollSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
        >
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 snap-x snap-mandatory pb-2" style={{ width: "max-content" }}>
          {children}
        </div>
      </div>
    </section>
  );
}
