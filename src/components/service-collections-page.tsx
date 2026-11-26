"use client";

import { SectionHeading } from "./section-heading.js";
import { Plus, Ticket, Users } from "lucide-react";
import { collectionHref } from "@medialane/sdk";
import Link from "./link.js";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { Stagger, StaggerItem } from "./motion-primitives.js";
import { BackButton } from "./back-button.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { CollectionCard } from "./collection-card.js";
import { SignInPrompt } from "./sign-in-prompt.js";
import { useMedialaneApp } from "./medialane-app.js";
import { getLaunchpadService } from "../data/launchpad-services.js";
import { useMyClubCollections, useMyTicketCollections } from "../utils/use-tiers.js";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";
import { IconTile } from "./icon-tile.js";

const KINDS = {
  tickets: {
    icon: Ticket,
    title: getLaunchpadService("ip-tickets").title,
    createHref: "/launchpad/tickets/create",
    createLabel: msg("Create collection"),
    sectionTitle: msg("Ticket collections"),
    empty: msg("Your ticket collections appear here"),
    emptyText: msg("Create your first tickets collection."),
    accent: "bg-brand-blue",
  },
  club: {
    icon: Users,
    title: getLaunchpadService("ip-club").title,
    createHref: "/launchpad/club/create",
    createLabel: msg("Create club"),
    sectionTitle: msg("Club collections"),
    empty: msg("Your clubs appear here"),
    emptyText: msg("Create your first club."),
    accent: "bg-brand-purple",
  },
} as const;

export function ServiceCollectionsPage({ kind }: { kind: keyof typeof KINDS }) {
  const t = useT();
  const config = KINDS[kind];
  const Icon = config.icon;
  const { walletAddress, walletLoading } = useMedialaneApp();
  const tickets = useMyTicketCollections(kind === "tickets" ? walletAddress : null);
  const clubs = useMyClubCollections(kind === "club" ? walletAddress : null);
  const { collections, isLoading } = kind === "tickets" ? tickets : clubs;

  const createButton = (
    <Button asChild size="sm" className={`${config.accent} gap-1.5 text-white hover:brightness-110`}>
      <Link href={config.createHref}>
        <Plus className="h-3.5 w-3.5" />
        {t(config.createLabel)}
      </Link>
    </Button>
  );
  const iconTile = (
    <IconTile size="lg">
      <Icon />
    </IconTile>
  );

  return (
    <PageContainer variant="narrow" className="space-y-8">
      <PageHeader back={<BackButton />} icon={<Icon />} title={t(config.title)}>
        {createButton}
      </PageHeader>

      <section className="space-y-4">
        <SectionHeading title={t(config.sectionTitle)} />

        {!walletAddress && !walletLoading ? (
          <SignInPrompt icon={iconTile} title={t("Sign in to see your collections")} />
        ) : isLoading || walletLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="panel relative overflow-hidden space-y-4 p-12 text-center">
            <div className="flex justify-center">{iconTile}</div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{t(config.empty)}</p>
              <p className="text-xs text-muted-foreground">{t(config.emptyText)}</p>
            </div>
            {createButton}
          </div>
        ) : (
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {collections.map((col) => (
              <StaggerItem key={col.contractAddress}>
                <CollectionCard collection={col} href={collectionHref("STARKNET", col.contractAddress)} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </PageContainer>
  );
}
