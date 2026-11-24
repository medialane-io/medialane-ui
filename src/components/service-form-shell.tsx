import type { ReactNode } from "react";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";

export interface ServiceFormShellProps {

  icon: ReactNode;
  title: string;
  subtitle?: string;

  headerAccessory?: ReactNode;

  backSlot?: ReactNode;

  aside?: ReactNode;

  aboveForm?: ReactNode;

  children: ReactNode;
}

export function ServiceFormShell({ icon, title, subtitle, headerAccessory, backSlot, aside, aboveForm, children }: ServiceFormShellProps) {
  const header = <PageHeader back={backSlot} icon={icon} title={title} subtitle={subtitle}>{headerAccessory}</PageHeader>;

  return (
    <PageContainer variant="narrow" className={aside ? "pb-20" : "max-w-3xl pb-20"}>
      {aside ? (
        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          <div className="space-y-8 lg:col-span-8">
            {header}
            {aboveForm}
            {children}
          </div>
          <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-24">{aside}</div>
        </div>
      ) : (
        <div className="space-y-8">
          {header}
          {children}
        </div>
      )}
    </PageContainer>
  );
}
