import { Layers, Ticket, Users } from "lucide-react";
import type { ElementType } from "react";
import { msg } from "../../i18n/translate.js";

export interface CollectionCreateAction {
  href: string;
  label: string;
}

export interface CollectionCreatePreset {
  service: "ip-club" | "ip-tickets" | "mip-erc1155" | null;
  icon: ElementType;
  iconClass: string;
  signedOut: { title: string; description: string };
  shell: { title: string };
  dialog: { title: string; workingLabel: string; firstStepLabel: string };
  success: { title: string; description: string; fallbackName: string; reward: string; againLabel: string };
  cardFallbackSymbol: string;
  copy: {
    imageHeading: string;
    nameLabel: string;
    namePlaceholder: string;
    symbolPlaceholder: string;
    symbolHint: string;
    descriptionPlaceholder: string;
    submit: string;
  };
  suggestSymbol: boolean;
  registerAfterDeploy: boolean;
  actions: (found: { address: string | null; collectionHref: string | null }) => {
    primary?: CollectionCreateAction;
    secondary?: CollectionCreateAction;
  };
}

export const CLUB_PRESET: CollectionCreatePreset = {
  service: "ip-club",
  icon: Users,
  iconClass: "text-brand-purple",
  signedOut: { title: msg("Secure your account to create a club"), description: msg("Create a club with membership cards.") },
  shell: { title: msg("Create club") },
  dialog: { title: msg("Create club"), workingLabel: msg("Creating your club…"), firstStepLabel: msg("Saving details") },
  success: { title: msg("Club created"), description: msg("Each membership you create is saved permanently as yours."), fallbackName: msg("Your club"), reward: msg("create_club"), againLabel: msg("Create another") },
  cardFallbackSymbol: msg("Club"),
  copy: {
    imageHeading: msg("Cover image"),
    nameLabel: msg("Name"),
    namePlaceholder: msg("My Club"),
    symbolPlaceholder: msg("CLUB"),
    symbolHint: msg("2 to 10 letters."),
    descriptionPlaceholder: msg("What membership unlocks"),
    submit: msg("Create club"),
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => ({ primary: collectionHref ? { href: collectionHref, label: msg("Create memberships") } : undefined }),
};

export const TICKETS_PRESET: CollectionCreatePreset = {
  service: "ip-tickets",
  icon: Ticket,
  iconClass: "text-brand-blue",
  signedOut: { title: msg("Secure your account to create tickets"), description: msg("Create a tickets collection.") },
  shell: { title: msg("Create ticket collection") },
  dialog: { title: msg("Create tickets collection"), workingLabel: msg("Creating your collection…"), firstStepLabel: msg("Saving details") },
  success: { title: msg("Ticket collection created"), description: msg("Each ticket you publish in it is saved permanently as yours."), fallbackName: msg("Your collection"), reward: msg("create_ticket_collection"), againLabel: msg("Create another") },
  cardFallbackSymbol: msg("Tickets"),
  copy: {
    imageHeading: msg("Cover image"),
    nameLabel: msg("Name"),
    namePlaceholder: msg("My tickets"),
    symbolPlaceholder: msg("TIX"),
    symbolHint: msg("2 to 10 letters."),
    descriptionPlaceholder: msg("What the tickets unlock"),
    submit: msg("Create ticket collection"),
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => ({ primary: collectionHref ? { href: collectionHref, label: msg("Create tickets") } : undefined }),
};

export const EDITIONS_PRESET: CollectionCreatePreset = {
  service: "mip-erc1155",
  icon: Layers,
  iconClass: "text-brand-purple",
  signedOut: { title: msg("Secure your account to create a collection"), description: msg("Create a collection where each piece can have multiple editions.") },
  shell: { title: msg("Create an edition collection") },
  dialog: { title: msg("Create collection"), workingLabel: msg("Creating your collection…"), firstStepLabel: msg("Saving details") },
  success: { title: msg("Collection created"), description: msg("Each work you publish in it has its own license terms."), fallbackName: msg("Your collection"), reward: msg("create_collection"), againLabel: msg("Create another") },
  cardFallbackSymbol: msg("Editions"),
  copy: {
    imageHeading: msg("Cover image"),
    nameLabel: msg("Name"),
    namePlaceholder: msg("My Creative Works"),
    symbolPlaceholder: msg("MCW"),
    symbolHint: msg("2 to 10 letters."),
    descriptionPlaceholder: msg("What this collection is about"),
    submit: msg("Create collection"),
  },
  suggestSymbol: true,
  registerAfterDeploy: true,
  actions: ({ address, collectionHref }) => ({
    primary: address ? { href: `/launchpad/nfteditions/${address}/mint`, label: msg("Mint Limited Editions") } : undefined,
    secondary: collectionHref ? { href: collectionHref, label: msg("View collection") } : undefined,
  }),
};

export const SINGLE_PRESET: CollectionCreatePreset = {
  service: null,
  icon: Layers,
  iconClass: "text-brand-blue",
  signedOut: { title: msg("Secure your account to create a collection"), description: msg("Set up a collection for your work.") },
  shell: { title: msg("Create a collection") },
  dialog: { title: msg("Create collection"), workingLabel: msg("Creating your collection…"), firstStepLabel: msg("Saving details") },
  success: { title: msg("Collection created"), description: msg("Each work you publish in it has its own license terms."), fallbackName: msg("Your collection"), reward: msg("create_collection"), againLabel: msg("Create another") },
  cardFallbackSymbol: msg("Collection"),
  copy: {
    imageHeading: msg("Cover image"),
    nameLabel: msg("Name"),
    namePlaceholder: msg("My Creative Works"),
    symbolPlaceholder: msg("MCW"),
    symbolHint: msg("2 to 10 letters."),
    descriptionPlaceholder: msg("What this collection is about"),
    submit: msg("Create collection"),
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => {
    const mint = { href: "/launchpad/single-editions", label: msg("Publish a work") };
    return collectionHref ? { primary: { href: collectionHref, label: msg("View collection") }, secondary: mint } : { primary: mint };
  },
};
