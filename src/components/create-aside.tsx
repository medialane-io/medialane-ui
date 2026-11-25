"use client";

import {
  ArrowLeftRight, Award, ChevronRight, FileCheck, Gem, Gift, KeyRound, Layers, LayoutGrid, Lock, Plus, Scale, ShieldCheck, Sparkles, Ticket, Users, Wallet,
} from "lucide-react";
import { ClaimRail, type ClaimRailProps } from "./claim-rail.js";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";

const ASIDES = {
  asset: {
    included: [
      { icon: Gem, title: msg("A unique piece"), desc: msg("A one-of-a-kind work.") },
      { icon: Scale, title: msg("Licensing you control"), desc: msg("Set how others use it.") },
      { icon: LayoutGrid, title: msg("On your profile"), desc: msg("Shown on your profile and collection.") },
    ],
    steps: [msg("Upload the work"), msg("Choose licensing terms"), msg("Publish for free")],
    trustIcon: Gift,
    trustLead: msg("Creator-owned."),
    trust: msg("Authorship is recorded permanently."),
  },
  club: {
    included: [
      { icon: Users, title: msg("Unlimited tiers"), desc: msg("Add tiers anytime.") },
      { icon: ChevronRight, title: msg("Full control"), desc: msg("Only the creator can add cards.") },
    ],
    steps: [msg("Create the club"), msg("Add membership tiers"), msg("Sell cards on the marketplace")],
    trustIcon: Users,
    trustLead: msg("Creator-owned."),
    trust: msg("Members trade their cards freely."),
  },
  coin: {
    included: [
      { icon: ShieldCheck, title: msg("Fixed supply forever"), desc: msg("No more can ever be created.") },
      { icon: Wallet, title: msg("Purchased at market price"), desc: msg("Creator buy capped at 10%.") },
      { icon: KeyRound, title: msg("Ownership renounced"), desc: msg("Renounced automatically at launch.") },
      { icon: ArrowLeftRight, title: msg("You choose the pair"), desc: msg("Pick any supported coin.") },
    ],
    steps: [msg("Design the coin"), msg("Set the economics"), msg("Launch")],
    trustIcon: Lock,
    trustLead: msg("Locked forever."),
    trust: msg("Liquidity is locked and fees stay collectible."),
  },
  collection: {
    included: [
      { icon: Layers, title: msg("Your own collection"), desc: msg("Owned by its creator.") },
      { icon: LayoutGrid, title: msg("A branded page"), desc: msg("Custom page and URL.") },
      { icon: Plus, title: msg("Publish your work in it"), desc: msg("Add pieces anytime.") },
    ],
    steps: [msg("Add a name and image"), msg("Publish for free"), msg("Start publishing")],
    trustIcon: Gift,
    trustLead: msg("Creator-owned."),
    trust: msg("Publishing is free."),
  },
  editions: {
    included: [
      { icon: Layers, title: msg("Multi-edition collection"), desc: msg("Many editions per piece.") },
      { icon: LayoutGrid, title: msg("A branded page"), desc: msg("Custom page and URL.") },
      { icon: Plus, title: msg("Publish editions anytime"), desc: msg("Add editions anytime.") },
    ],
    steps: [msg("Add a name and image"), msg("Publish for free"), msg("Publish editions")],
    trustIcon: Gift,
    trustLead: msg("Creator-owned."),
    trust: msg("Publishing is free."),
  },
  pop: {
    included: [
      { icon: Award, title: msg("An immutable certificate"), desc: msg("A certificate of attendance.") },
      { icon: Ticket, title: msg("Theirs to keep"), desc: msg("A lasting record of being there.") },
      { icon: LayoutGrid, title: msg("A branded event page"), desc: msg("A page with a claim link.") },
    ],
    steps: [msg("Add event details"), msg("Publish for free"), msg("Share the link")],
    trustIcon: Gift,
    trustLead: msg("Creator-owned."),
    trust: msg("Publishing is free."),
  },
  tickets: {
    included: [
      { icon: Ticket, title: msg("Unlimited tickets"), desc: msg("Add tickets anytime.") },
      { icon: ChevronRight, title: msg("Full control"), desc: msg("Only the creator can add tickets.") },
    ],
    steps: [msg("Create the tickets collection"), msg("Add tickets"), msg("Send tickets to the audience")],
    trustIcon: Ticket,
    trustLead: msg("Permanent."),
    trust: msg("Holders keep their tickets."),
  },
  mintEdition: {
    included: [
      { icon: Sparkles, title: msg("A new piece"), desc: msg("A new artwork in the collection.") },
      { icon: Layers, title: msg("Any number of copies"), desc: msg("Choose the number of copies.") },
      { icon: FileCheck, title: msg("Recorded as yours"), desc: msg("Authorship saved permanently.") },
    ],
    steps: [msg("Add details and image"), msg("Choose the number of copies"), msg("Publish for free")],
    trustIcon: Gift,
    trustLead: msg("Creator-owned."),
    trust: msg("Publishing is free."),
  },
} satisfies Record<string, ClaimRailProps>;

export type CreateAsideKind = keyof typeof ASIDES;

export const CREATE_ASIDE_KINDS = Object.keys(ASIDES) as CreateAsideKind[];

export function CreateAside({ kind }: { kind: CreateAsideKind }) {
  const t = useT();
  const { included = [], steps, trustLead, trust, trustIcon }: ClaimRailProps = ASIDES[kind];
  return (
    <ClaimRail
      trustIcon={trustIcon}
      included={included.map((item) => ({ ...item, title: t(item.title), desc: t(item.desc) }))}
      steps={steps.map((step) => t(step))}
      trustLead={trustLead ? t(trustLead) : undefined}
      trust={trust ? t(trust) : undefined}
    />
  );
}
