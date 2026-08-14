"use client";

import Link from "next/link";
import { Users } from "lucide-react";

export interface ClubOwnerActionsProps {
  contractAddress: string;

  isOwner: boolean;
}

export function ClubOwnerActions({ contractAddress, isOwner }: ClubOwnerActionsProps) {
  if (!isOwner) return null;

  return (
    <div className="btn-border-animated p-[1px] rounded-xl">
      <Link
        href={`/launchpad/club/${contractAddress}/mint`}
        className="flex items-center gap-2 h-10 px-5 rounded-[11px] text-sm font-semibold text-white bg-transparent hover:brightness-110 active:scale-[0.98] transition"
      >
        <Users className="h-4 w-4" />
        Create membership
      </Link>
    </div>
  );
}
