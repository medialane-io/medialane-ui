import { Ticket, Users } from "lucide-react";
import type { ElementType } from "react";
import type { ApiClient } from "@medialane/sdk";
import { predictNextMembershipId, predictNextTicketId } from "../../utils/use-tiers.js";

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
  shell: { title: string; subtitle: (collectionName: string | null) => string };
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
  signedOut: { title: "Secure your account to create memberships", description: "Create a membership tier and mint its supply to your account." },
  back: { href: "/launchpad/club", label: "← Back" },
  notOwner: { message: "You don't own this club.", back: { href: "/launchpad/club", label: "← Back to clubs" } },
  dialog: { title: "Create membership", workingLabel: "Creating your membership…", firstStepLabel: "Upload membership metadata" },
  success: { title: "Membership created", description: "The supply is minted to your wallet and ready to list.", againLabel: "Create another membership" },
  shell: {
    title: "Create Membership",
    subtitle: (name) => `Add a new membership tier to ${name ?? "your club"} and mint its supply to your wallet, ready to list.`,
  },
  cardFallbackSymbol: "Club",
  copy: {
    imageHeading: "Membership image",
    imageAlt: "Membership",
    imageRequired: "Add a membership image.",
    nameLabel: "Membership name",
    nameRequired: "Membership name required",
    namePlaceholder: "Kalamaha Fan Club — 2026 Season Pass",
    descriptionPlaceholder: "What does this membership unlock?",
    validUntilHint: "Blank = lifetime membership.",
    submit: "Create Membership",
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
  signedOut: { title: "Secure your account to mint tickets", description: "Create a ticket type and mint its supply to your account." },
  back: { href: "/launchpad/tickets", label: "← Back" },
  notOwner: { message: "You don't own this tickets collection.", back: { href: "/launchpad/tickets", label: "← Back to tickets" } },
  dialog: { title: "Mint tickets", workingLabel: "Minting your tickets…", firstStepLabel: "Upload ticket metadata" },
  success: { title: "Tickets minted", description: "Each ticket is recorded onchain under your wallet.", againLabel: "Mint another ticket" },
  shell: {
    title: "Mint Tickets",
    subtitle: (name) => `Add a new ticket type to ${name ?? "your collection"} and mint its supply to your wallet, ready to list.`,
  },
  cardFallbackSymbol: "Tickets",
  copy: {
    imageHeading: "Ticket image",
    imageAlt: "Ticket",
    imageRequired: "Add a ticket image.",
    nameLabel: "Ticket name",
    nameRequired: "Ticket name required",
    namePlaceholder: "Summer Concert 2026 — General Admission",
    descriptionPlaceholder: "What does this ticket admit or unlock?",
    validUntilHint: "Blank = always valid.",
    submit: "Mint Tickets",
  },
};
