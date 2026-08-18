"use client";

import { cn } from "../utils/cn.js";
import {
  PortfolioSection,
  type PortfolioSectionProps,
} from "./portfolio-section.js";

export interface PortfolioSectionConfig {
  key: string;
  title: string;
  href: string;
  color?: PortfolioSectionProps["color"];
  size?: PortfolioSectionProps["size"];

  isEmpty?: boolean;
  content: React.ReactNode;
}

export interface PortfolioSectionGridProps {
  sections: PortfolioSectionConfig[];

  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export function PortfolioSectionGrid({
  sections,
  isEmpty,
  emptyState,
  className,
}: PortfolioSectionGridProps) {
  if (isEmpty) {
    return <div className={className}>{emptyState}</div>;
  }

  const populated = sections.filter((s) => !s.isEmpty);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start",
        className,
      )}
    >
      {populated.map((section) => (
        <PortfolioSection
          key={section.key}
          title={section.title}
          href={section.href}
          color={section.color}
          size={section.size}
        >
          {section.content}
        </PortfolioSection>
      ))}
    </div>
  );
}
