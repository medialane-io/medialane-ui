import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { ServiceHeader } from "./service-header.js";

export interface ServiceFormShellProps {

  icon: ReactNode;
  title: string;
  subtitle: string;

  headerAccessory?: ReactNode;

  backSlot?: ReactNode;

  aside?: ReactNode;

  aboveForm?: ReactNode;

  children: ReactNode;
}

export function ServiceFormShell({ icon, title, subtitle, headerAccessory, backSlot, aside, aboveForm, children }: ServiceFormShellProps) {
  const header = <ServiceHeader bare icon={icon} title={title} subtitle={subtitle} headerAccessory={headerAccessory} />;

  return (
    <div className={cn("container mx-auto px-4 sm:px-6 py-10 space-y-6 pb-20", aside ? "max-w-5xl" : "max-w-3xl")}>
      {backSlot}
      {aside ? (
        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:col-span-8">
            {header}
            {aboveForm}
            {children}
          </div>
          <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-24">{aside}</div>
        </div>
      ) : (
        <div className="space-y-6">
          {header}
          {children}
        </div>
      )}
    </div>
  );
}
