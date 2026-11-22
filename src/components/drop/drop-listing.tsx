"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import type { ApiDropListStatus } from "@medialane/sdk";
import Link from "../link.js";
import { Tabs, TabsList, TabsTrigger } from "../tabs.js";
import { TabEmptyState } from "../tab-empty-state.js";
import { DropGrid, DropGridSkeleton } from "./drop-card.js";
import { useDrops } from "../../utils/use-drops.js";
import { useNow } from "../../utils/drop/use-now.js";
import { useT } from "../../i18n/provider.js";
import { msg } from "../../i18n/translate.js";
import { Button } from "../button.js";

const EMPTY: Record<ApiDropListStatus, { heading: string; body: string }> = {
  live: { heading: msg("No live drops"), body: msg("Live drops appear here.") },
  upcoming: { heading: msg("No upcoming drops"), body: msg("Scheduled drops will show here before they open.") },
  ended: { heading: msg("No ended drops"), body: msg("Drops that sold out or closed will show here.") },
};

export function DropListing({
  createHref = "/launchpad/drop/create",
  myDropsHref = "/launchpad/drop/my-drops",
}: {
  createHref?: string;
  myDropsHref?: string;
}) {
  const t = useT();
  const [tab, setTab] = useState<ApiDropListStatus>("live");
  const { drops, isLoading } = useDrops(tab);
  const now = useNow(60_000);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ApiDropListStatus)}>
          <TabsList>
            <TabsTrigger value="live">{t("Live")}</TabsTrigger>
            <TabsTrigger value="upcoming">{t("Upcoming")}</TabsTrigger>
            <TabsTrigger value="ended">{t("Ended")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="soft" size="sm" asChild><Link href={myDropsHref}>{t("My drops")}</Link></Button>
          <Link href={createHref} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
            <Plus className="h-3.5 w-3.5" />
            {t("Create a drop")}
          </Link>
        </div>
      </div>
      {isLoading ? <DropGridSkeleton /> : drops.length === 0 ? <TabEmptyState icon={Package} {...EMPTY[tab]} /> : <DropGrid drops={drops} now={now} />}
    </div>
  );
}
