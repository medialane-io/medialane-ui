"use client";

import { Plus, Ticket, Users } from "lucide-react";
import { collectionHref } from "@medialane/sdk";
import Link from "./link.js";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { BackButton } from "./back-button.js";
import { ServiceHeader } from "./service-header.js";
import { CollectionCard } from "./collection-card.js";
import { SignInPrompt } from "./sign-in-prompt.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useMyClubCollections, useMyTicketCollections } from "../utils/use-tiers.js";

const KINDS = {
  tickets: {
    icon: Ticket,
    title: "IP Tickets",
    subtitle: "Create a tickets collection, then mint tickets from its collection page.",
    createHref: "/launchpad/tickets/create",
    createLabel: "Create collection",
    sectionLabel: "Your collections",
    sectionTitle: "Ticket collections",
    empty: "No collections yet",
    emptyText: "Create your first tickets collection.",
    accent: "bg-brand-blue",
    tint: "bg-brand-blue/10 text-brand-blue/40",
  },
  club: {
    icon: Users,
    title: "IP Club",
    subtitle: "Create a club, then create membership tiers from its collection page.",
    createHref: "/launchpad/club/create",
    createLabel: "Create club",
    sectionLabel: "Your clubs",
    sectionTitle: "Club collections",
    empty: "No clubs yet",
    emptyText: "Create your first club.",
    accent: "bg-brand-purple",
    tint: "bg-brand-purple/10 text-brand-purple/40",
  },
} as const;

export function ServiceCollectionsPage({ kind }: { kind: keyof typeof KINDS }) {
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
        {config.createLabel}
      </Link>
    </Button>
  );
  const iconTile = (
    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${config.tint}`}>
      <Icon className="h-8 w-8" />
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      <section className="px-4 pt-10">
        <BackButton />
        <FadeIn>
          <div className="mt-6">
            <ServiceHeader plain icon={<Icon className="h-4 w-4 text-white" />} title={config.title} subtitle={config.subtitle} headerAccessory={createButton} />
          </div>
        </FadeIn>
      </section>

      <section className="space-y-4 px-4">
        <div>
          <p className="section-label">{config.sectionLabel}</p>
          <h2 className="mt-0.5 text-xl font-bold">{config.sectionTitle}</h2>
        </div>

        {!walletAddress && !walletLoading ? (
          <SignInPrompt icon={iconTile} title="Sign in to see your collections" />
        ) : isLoading || walletLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="bento-cell space-y-4 border-dashed p-12 text-center">
            <div className="flex justify-center">{iconTile}</div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{config.empty}</p>
              <p className="text-xs text-muted-foreground">{config.emptyText}</p>
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
    </div>
  );
}
