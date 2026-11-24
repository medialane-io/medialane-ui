"use client";

import type { ElementType, ReactNode } from "react";
import { Wallet } from "lucide-react";
import { PageState, PageStateSkeleton } from "./page-state.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useT } from "../i18n/provider.js";
import { ActionButton } from "./action-button.js";

export interface WalletRequiredProps {
  icon: ElementType;
  iconClassName?: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function WalletRequired({ icon: Icon, iconClassName, title, description, children }: WalletRequiredProps) {
  const t = useT();
  const { walletAddress, walletLoading, onRequireWallet, connectLabel } = useMedialaneApp();

  if (walletAddress) return <>{children}</>;

  if (walletLoading) {
    return (
      <PageStateSkeleton action />
    );
  }

  return (
    <PageState icon={Icon} iconClassName={iconClassName} title={title} description={description}>
      <ActionButton solid onClick={onRequireWallet} icon={<Wallet className="h-4 w-4" />}>
        {connectLabel ?? t("Connect")}
      </ActionButton>
    </PageState>
  );
}
