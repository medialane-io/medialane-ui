import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { ServiceHeader } from "./service-header.js";

export interface ServiceFormShellProps {
  /** Rendered icon element for the header, e.g. <Coins className="h-4 w-4 text-white" />. */
  icon: ReactNode;
  title: string;
  subtitle: string;
  /** Optional element under the header subtitle (e.g. a URL pill). */
  headerAccessory?: ReactNode;
  /** Rendered above the header — the app's own back button (router-specific). */
  backSlot?: ReactNode;
  /** Right-rail panels (e.g. <ClaimRail/>). When present, lays out an 8/4 bento. */
  aside?: ReactNode;
  /** Rendered in the left column between the header and the form — e.g. a
   *  <StepNav/> for multi-step flows. Only used in the aside (8/4) layout. */
  aboveForm?: ReactNode;
  /** The form. **Already gated by the app** — wrap it in your own auth/wallet
   *  gate before passing. This component stays presentation-only (no auth,
   *  no router) so both apps can share it. */
  children: ReactNode;
}

/** Shared launchpad/claim form layout: back slot + gradient header, then the
 *  form inside the animated full-spectrum border (`.btn-border-animated`, from
 *  @medialane/ui/styles). With an `aside` it lays out an 8/4 bento (form left,
 *  rail right); without, a single centered column. */
export function ServiceFormShell({ icon, title, subtitle, headerAccessory, backSlot, aside, aboveForm, children }: ServiceFormShellProps) {
  // Plain header: the form below already carries the animated gradient border,
  // so the header drops its gradient frame to keep a single focal accent.
  const header = <ServiceHeader plain icon={icon} title={title} subtitle={subtitle} headerAccessory={headerAccessory} />;

  // The form is the focus: animated gradient border around the dark card.
  const form = aside ? (
    <div className="btn-border-animated p-[1.5px] rounded-2xl">
      <div className="rounded-[15px] bg-card p-5 sm:p-6">{children}</div>
    </div>
  ) : (
    children
  );

  return (
    <div className={cn("container mx-auto px-4 sm:px-6 py-10 space-y-6 pb-20", aside ? "max-w-5xl" : "max-w-3xl")}>
      {backSlot}
      {aside ? (
        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:col-span-8">
            {header}
            {aboveForm}
            {form}
          </div>
          <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-24">{aside}</div>
        </div>
      ) : (
        <div className="space-y-6">
          {header}
          {form}
        </div>
      )}
    </div>
  );
}
