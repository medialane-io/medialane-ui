"use client";

import { BackButton } from "./back-button.js";
import { ServiceFormShell, type ServiceFormShellProps } from "./service-form-shell.js";
import { useT } from "../i18n/provider.js";

export function ClaimRouteShell({ title, subtitle, ...props }: Omit<ServiceFormShellProps, "backSlot">) {
  const t = useT();
  return <ServiceFormShell {...props} title={t(title)} subtitle={subtitle ? t(subtitle) : undefined} backSlot={<BackButton />} />;
}
