"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import type { ApiDropListStatus } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import Link from "../link.js";
import { Tabs, TabsList, TabsTrigger } from "../tabs.js";
import { TabEmptyState } from "../tab-empty-state.js";
import { DropGrid, DropGridSkeleton } from "./drop-card.js";
import { useDrops } from "../../utils/use-drops.js";
import { useNow } from "../../utils/drop/use-now.js";

const EMPTY: Record<ApiDropListStatus, { heading: string; body: string }> = {
  live: { heading: "No live drops", body: "Nothing is open for minting right now. Check Upcoming, or launch your own." },
  upcoming: { heading: "No upcoming drops", body: "Scheduled drops will show here before they open." },
  ended: { heading: "No ended drops", body: "Drops that sold out or closed will show here." },
};

export function DropListing({
  getClient,
  createHref = "/launchpad/drop/create",
  myDropsHref = "/launchpad/drop/my-drops",
}: {
  getClient: () => MedialaneClient;
  createHref?: string;
  myDropsHref?: string;
}) {
  const [tab, setTab] = useState<ApiDropListStatus>("live");
  const { drops, isLoading } = useDrops(getClient, tab);
  const now = useNow(60_000);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ApiDropListStatus)}>
          <TabsList>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Link href={myDropsHref} className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm hover:bg-muted/60">My drops</Link>
          <Link href={createHref} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
            <Plus className="h-3.5 w-3.5" />
            Create a drop
          </Link>
        </div>
      </div>
      {isLoading ? <DropGridSkeleton /> : drops.length === 0 ? <TabEmptyState icon={Package} {...EMPTY[tab]} /> : <DropGrid drops={drops} now={now} />}
    </div>
  );
}
