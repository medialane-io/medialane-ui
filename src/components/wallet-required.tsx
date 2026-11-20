"use client";

import type { ElementType, ReactNode } from "react";
import { Wallet } from "lucide-react";
import { Skeleton } from "./skeleton.js";
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

export function WalletRequired({ icon: Icon, iconClassName = "text-muted-foreground", title, description, children }: WalletRequiredProps) {
  const t = useT();
  const { walletAddress, walletLoading, onRequireWallet, connectLabel } = useMedialaneApp();

  if (walletAddress) return <>{children}</>;

  if (walletLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-24 pb-8 space-y-4">
        <Skeleton className="h-10 w-10 rounded-full mx-auto" />
        <Skeleton className="h-7 w-56 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
        <Skeleton className="h-10 w-44 mx-auto rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-8 text-center space-y-4">
      <Icon className={`h-10 w-10 mx-auto ${iconClassName}`} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <ActionButton solid onClick={onRequireWallet} icon={<Wallet className="h-4 w-4" />}>
        {connectLabel ?? t("Connect")}
      </ActionButton>
    </div>
  );
}
