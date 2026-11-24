"use client";

import type { ReactNode } from "react";
import Link from "./link.js";
import { ArrowRight } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";

export interface SectionHeadingProps {
  title: ReactNode;
  icon?: ReactNode;
  subtitle?: ReactNode;
  href?: string;
  linkLabel?: string;
  action?: ReactNode;
  id?: string;
}

export function SectionHeading({ title, icon, subtitle, href, linkLabel = msg("View all"), action, id }: SectionHeadingProps) {
  const t = useT();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="shrink-0 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
        <div className="min-w-0">
          <h2 id={id} className="text-lg font-semibold leading-tight tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action ?? (href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {t(linkLabel)} <ArrowRight className="h-3 w-3" />
        </Link>
      ))}
    </div>
  );
}
