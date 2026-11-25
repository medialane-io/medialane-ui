import { Ticket, Users } from "lucide-react";
import type { ElementType } from "react";
import type { ApiClient } from "@medialane/sdk";
import { predictNextMembershipId, predictNextTicketId } from "../../utils/use-tiers.js";
import { msg } from "../../i18n/translate.js";
import type { T } from "../../i18n/make-t.js";

export interface TierMintPreset {
  service: "ip-club" | "ip-tickets";
  predictNextId: (api: ApiClient, contract: string) => Promise<number>;
  traitType: string;
  icon: ElementType;
  iconClass: string;
  suggestExternalLink: boolean;
  signedOut: { title: string; description: string };
  back: { href: string; label: string };
  notOwner: { message: string; back: { href: string; label: string } };
  dialog: { title: string; workingLabel: string; firstStepLabel: string };
  success: { title: string; description: string; againLabel: string };
  shell: { title: string; subtitle: (collectionName: string | null, t: T) => string };
  cardFallbackSymbol: string;
  copy: {
    imageHeading: string;
    imageAlt: string;
    imageRequired: string;
    nameLabel: string;
    nameRequired: string;
    namePlaceholder: string;
    supplyLabel: string;
    supplyRequired: string;
    descriptionPlaceholder: string;
    validUntilHint: string;
    submit: string;
  };
}

export const CLUB_TIER_PRESET: TierMintPreset = {
  service: "ip-club",
  predictNextId: predictNextMembershipId,
  traitType: "IP Club Membership",
  icon: Users,
  iconClass: "text-brand-purple",
  suggestExternalLink: false,
  signedOut: { title: msg("Secure your account to create memberships"), description: msg("Create a membership tier and choose how many.") },
  back: { href: "/launchpad/club", label: msg("← Back") },
  notOwner: { message: msg("You don't own this club."), back: { href: "/launchpad/club", label: msg("← Back to clubs") } },
  dialog: { title: msg("Create membership"), workingLabel: msg("Creating your membership…"), firstStepLabel: msg("Saving details") },
  success: { title: msg("Membership created"), description: msg("They're in your account, ready to sell."), againLabel: msg("Create another membership") },
  shell: {
    title: msg("Create membership"),
    subtitle: (name, t) => t("Add a membership tier to {name}.", { name: name ?? t("your club") }),
  },
  cardFallbackSymbol: msg("Club"),
  copy: {
    imageHeading: msg("Cover image"),
    imageAlt: msg("Membership"),
    imageRequired: msg("Add a membership image."),
    nameLabel: msg("Name"),
    nameRequired: msg("Name required"),
    namePlaceholder: msg("2026 Season Pass"),
    supplyLabel: msg("Number of memberships"),
    supplyRequired: msg("Number of memberships required"),
    descriptionPlaceholder: msg("What does this membership unlock?"),
    validUntilHint: msg("Blank = lifetime membership."),
    submit: msg("Create membership"),
  },
};

export const TICKETS_TIER_PRESET: TierMintPreset = {
  service: "ip-tickets",
  predictNextId: predictNextTicketId,
  traitType: "IP Ticket",
  icon: Ticket,
  iconClass: "text-brand-blue",
  suggestExternalLink: true,
  signedOut: { title: msg("Secure your account to publish tickets"), description: msg("Create a ticket type and choose how many.") },
  back: { href: "/launchpad/tickets", label: msg("← Back") },
  notOwner: { message: msg("You don't own this tickets collection."), back: { href: "/launchpad/tickets", label: msg("← Back to tickets") } },
  dialog: { title: msg("Publish tickets"), workingLabel: msg("Publishing your tickets…"), firstStepLabel: msg("Saving details") },
  success: { title: msg("Tickets published"), description: msg("Each ticket is saved permanently as yours."), againLabel: msg("Publish another ticket") },
  shell: {
    title: msg("Publish tickets"),
    subtitle: (name, t) => t("Add a ticket type to {name}.", { name: name ?? t("your collection") }),
  },
  cardFallbackSymbol: msg("Tickets"),
  copy: {
    imageHeading: msg("Cover image"),
    imageAlt: msg("Ticket"),
    imageRequired: msg("Add a ticket image."),
    nameLabel: msg("Name"),
    nameRequired: msg("Name required"),
    namePlaceholder: msg("Summer Concert 2026 — General Admission"),
    supplyLabel: msg("Number of tickets"),
    supplyRequired: msg("Number of tickets required"),
    descriptionPlaceholder: msg("What does this ticket admit or unlock?"),
    validUntilHint: msg("Blank = always valid."),
    submit: msg("Publish tickets"),
  },
};
