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
  buttonClass: string;
  hoverBorderClass: string;
  uploadedClass: string;
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
  buttonClass: "bg-brand-purple",
  hoverBorderClass: "hover:border-brand-purple/50",
  uploadedClass: "text-brand-purple",
  suggestExternalLink: false,
  signedOut: { title: msg("Secure your account to create memberships"), description: msg("Create a membership tier and mint its supply to your account.") },
  back: { href: "/launchpad/club", label: msg("← Back") },
  notOwner: { message: msg("You don't own this club."), back: { href: "/launchpad/club", label: msg("← Back to clubs") } },
  dialog: { title: msg("Create membership"), workingLabel: msg("Creating your membership…"), firstStepLabel: msg("Upload membership metadata") },
  success: { title: msg("Membership created"), description: msg("The supply is minted to your wallet and ready to sell."), againLabel: msg("Create another membership") },
  shell: {
    title: msg("Create Membership"),
    subtitle: (name, t) => t("Add a new membership tier to {name} and mint its supply to your wallet, ready to sell.", { name: name ?? t("your club") }),
  },
  cardFallbackSymbol: "Club",
  copy: {
    imageHeading: msg("Membership image"),
    imageAlt: msg("Membership"),
    imageRequired: msg("Add a membership image."),
    nameLabel: msg("Membership name"),
    nameRequired: msg("Membership name required"),
    namePlaceholder: msg("Kalamaha Fan Club — 2026 Season Pass"),
    descriptionPlaceholder: msg("What does this membership unlock?"),
    validUntilHint: msg("Blank = lifetime membership."),
    submit: msg("Create Membership"),
  },
};

export const TICKETS_TIER_PRESET: TierMintPreset = {
  service: "ip-tickets",
  predictNextId: predictNextTicketId,
  traitType: "IP Ticket",
  icon: Ticket,
  iconClass: "text-teal-500",
  buttonClass: "bg-teal-600",
  hoverBorderClass: "hover:border-teal-500/50",
  uploadedClass: "text-teal-500",
  suggestExternalLink: true,
  signedOut: { title: msg("Secure your account to mint tickets"), description: msg("Create a ticket type and mint its supply to your account.") },
  back: { href: "/launchpad/tickets", label: msg("← Back") },
  notOwner: { message: msg("You don't own this tickets collection."), back: { href: "/launchpad/tickets", label: msg("← Back to tickets") } },
  dialog: { title: msg("Mint tickets"), workingLabel: msg("Minting your tickets…"), firstStepLabel: msg("Upload ticket metadata") },
  success: { title: msg("Tickets minted"), description: msg("Each ticket is recorded onchain under your wallet."), againLabel: msg("Mint another ticket") },
  shell: {
    title: msg("Mint Tickets"),
    subtitle: (name, t) => t("Add a new ticket type to {name} and mint its supply to your wallet, ready to sell.", { name: name ?? t("your collection") }),
  },
  cardFallbackSymbol: "Tickets",
  copy: {
    imageHeading: msg("Ticket image"),
    imageAlt: msg("Ticket"),
    imageRequired: msg("Add a ticket image."),
    nameLabel: msg("Ticket name"),
    nameRequired: msg("Ticket name required"),
    namePlaceholder: msg("Summer Concert 2026 — General Admission"),
    descriptionPlaceholder: msg("What does this ticket admit or unlock?"),
    validUntilHint: msg("Blank = always valid."),
    submit: msg("Mint Tickets"),
  },
};
