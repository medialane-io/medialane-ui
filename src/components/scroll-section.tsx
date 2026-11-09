"use client";

import { SectionHeading } from "./section-heading.js";

export interface ScrollSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  href: string;
  linkLabel?: string;
  children: React.ReactNode;
}

export function ScrollSection({ icon, title, subtitle, href, linkLabel, children }: ScrollSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeading icon={icon} title={title} subtitle={subtitle} href={href} linkLabel={linkLabel} />

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-5 sm:gap-6 snap-x snap-mandatory pb-2" style={{ width: "max-content" }}>
          {children}
        </div>
      </div>
    </section>
  );
}
