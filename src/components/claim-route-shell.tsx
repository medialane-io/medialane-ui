"use client";

import { BackButton } from "./back-button.js";
import { ServiceFormShell, type ServiceFormShellProps } from "./service-form-shell.js";

export function ClaimRouteShell(props: Omit<ServiceFormShellProps, "backSlot">) {
  return <ServiceFormShell {...props} backSlot={<BackButton />} />;
}
