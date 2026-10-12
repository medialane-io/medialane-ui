"use client";

import { Package } from "lucide-react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import Link from "../link.js";
import { Button } from "../button.js";
import { TabEmptyState } from "../tab-empty-state.js";
import { DropGrid, DropGridSkeleton } from "./drop-card.js";
import { useMyDrops } from "../../utils/use-drops.js";
import { useNow } from "../../utils/drop/use-now.js";

export function MyDrops({
  getClient, walletAddress, onRequireWallet, connectLabel = "Sign in", createHref = "/launchpad/drop/create",
}: {
  getClient: () => MedialaneClient;
  walletAddress: string | null;
  onRequireWallet: () => void;
  connectLabel?: string;
  createHref?: string;
}) {
  const { drops, isLoading } = useMyDrops(getClient, walletAddress);
  const now = useNow(60_000);
  if (!walletAddress) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Sign in to see the drops you launched.</p>
        <Button onClick={onRequireWallet}>{connectLabel}</Button>
      </div>
    );
  }
  if (isLoading) return <DropGridSkeleton />;
  if (drops.length === 0) {
    return (
      <div className="space-y-4">
        <TabEmptyState icon={Package} heading="No drops yet" body="Launch an edition or a collection and it will show here." />
        <div className="text-center"><Link href={createHref} className="text-sm font-semibold text-primary">Create a drop</Link></div>
      </div>
    );
  }
  return <DropGrid drops={drops} now={now} manage />;
}
