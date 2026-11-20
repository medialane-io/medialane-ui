"use client";

import Link from "./link.js";
import { Users } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { ActionButton } from "./action-button.js";

export interface ClubOwnerActionsProps {
  contractAddress: string;

  isOwner: boolean;
}

export function ClubOwnerActions({ contractAddress, isOwner }: ClubOwnerActionsProps) {
  const t = useT();
  if (!isOwner) return null;

  return (
    <ActionButton solid asChild>
      <Link href={`/launchpad/club/${contractAddress}/mint`}>
        <Users className="h-4 w-4" />
        {t("Create membership")}
      </Link>
    </ActionButton>
  );
}
