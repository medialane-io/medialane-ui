import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface ServiceHeaderProps {
  /** Rendered icon element, e.g. <Coins className="h-4 w-4 text-white" />. */
  icon: ReactNode;
  title: string;
  subtitle: string;
  /** Optional element shown under the subtitle (e.g. a URL pill). */
  headerAccessory?: ReactNode;
  className?: string;
  /** Drop the brand gradient border for a plain neutral-bordered card. Used by
   *  ServiceFormShell (create/mint form pages) where the form already carries
   *  the animated gradient border, so the header shouldn't compete. Standalone
   *  headers (browse pages, coin page, /claim hub) keep the gradient. */
  plain?: boolean;
}

/** Shared launchpad/claim page header: a dark card with a solid primary icon
 *  chip, title + subtitle. By default it sits on a static brand gradient
 *  border; pass `plain` for a neutral-bordered card. Pure presentation —
 *  consuming app supplies the icon and (optionally) a header accessory. */
export function ServiceHeader({ icon, title, subtitle, headerAccessory, className, plain = false }: ServiceHeaderProps) {
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">{title}</h1>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">{subtitle}</p>
      {headerAccessory && <div className="mt-4">{headerAccessory}</div>}
    </>
  );

  if (plain) {
    return <div className={cn("rounded-2xl border border-border/60 bg-card p-6 sm:p-7", className)}>{body}</div>;
  }

  return (
    <div className={cn("rounded-2xl p-[1.5px] bg-gradient-to-br from-brand-blue via-brand-purple to-brand-rose", className)}>
      <div className="rounded-[15px] bg-card p-6 sm:p-7">{body}</div>
    </div>
  );
}
