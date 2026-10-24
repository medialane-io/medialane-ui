"use client";

import type { ElementType, ReactNode } from "react";
import { Wallet } from "lucide-react";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { useMedialaneApp } from "./medialane-app.js";

export interface WalletRequiredProps {
  icon: ElementType;
  iconClassName?: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function WalletRequired({ icon: Icon, iconClassName = "text-muted-foreground", title, description, children }: WalletRequiredProps) {
  const { walletAddress, walletLoading, onRequireWallet, connectLabel } = useMedialaneApp();

  if (walletAddress) return <>{children}</>;

  if (walletLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-24 pb-8 space-y-4">
        <Skeleton className="h-10 w-10 rounded-full mx-auto" />
        <Skeleton className="h-7 w-56 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
        <Skeleton className="h-10 w-44 mx-auto rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-8 text-center space-y-4">
      <Icon className={`h-10 w-10 mx-auto ${iconClassName}`} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="btn-border-animated inline-block p-[1px] rounded-lg">
        <Button
          onClick={onRequireWallet}
          className="bg-transparent text-white rounded-[7px] hover:bg-transparent hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Wallet className="h-4 w-4 mr-1.5" />
          {connectLabel ?? "Connect"}
        </Button>
      </div>
    </div>
  );
}
