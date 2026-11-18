"use client";

import Link from "./link.js";
import { Users } from "lucide-react";
import { useT } from "../i18n/provider.js";

export interface ClubOwnerActionsProps {
  contractAddress: string;

  isOwner: boolean;
}

export function ClubOwnerActions({ contractAddress, isOwner }: ClubOwnerActionsProps) {
  const t = useT();
  if (!isOwner) return null;

  return (
    <div className="btn-border-animated p-[1px] rounded-xl">
      <Link
        href={`/launchpad/club/${contractAddress}/mint`}
        className="flex items-center gap-2 h-10 px-5 rounded-[11px] text-sm font-semibold text-white bg-transparent hover:brightness-110 active:scale-[0.98] transition"
      >
        <Users className="h-4 w-4" />
        {t("Create membership")}
      </Link>
    </div>
  );
}
