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
  shell: { title: string; subtitle: string };
  dialog: { title: string; workingLabel: string; firstStepLabel: string };
  success: { title: string; description: string; fallbackName: string; reward: string; againLabel: string };
  cardFallbackSymbol: string;
  copy: {
    imageHeading: string;
    imageHelp?: string;
    nameLabel: string;
    namePlaceholder: string;
    nameHint: string;
    symbolPlaceholder: string;
    symbolHint: string;
    descriptionPlaceholder: string;
    descriptionHint?: string;
    submit: string;
    footnotes: string[];
  };
  suggestSymbol: boolean;
  registerAfterDeploy: boolean;
  actions: (found: { address: string | null; collectionHref: string | null }) => {
    primary?: CollectionCreateAction;
    secondary?: CollectionCreateAction;
  };
}

const FREE = "Free to publish.";

export const CLUB_PRESET: CollectionCreatePreset = {
  service: "ip-club",
  icon: Users,
  iconClass: "text-brand-purple",
  signedOut: { title: msg("Secure your account to create a club"), description: msg("Create a club with membership cards.") },
  shell: { title: msg("Create club"), subtitle: msg("One club with many tiers.") },
  dialog: { title: msg("Create club"), workingLabel: msg("Creating your club…"), firstStepLabel: msg("Prepare metadata") },
  success: { title: msg("Club created"), description: msg("Each membership you create is recorded onchain under your wallet."), fallbackName: msg("Your club"), reward: msg("create_club"), againLabel: msg("Create another") },
  cardFallbackSymbol: "Club",
  copy: {
    imageHeading: msg("Club image"),
    nameLabel: msg("Club name *"),
    namePlaceholder: msg("My Club"),
    nameHint: msg("Shown on every card."),
    symbolPlaceholder: msg("CLUB"),
    symbolHint: msg("2 to 10 uppercase letters."),
    descriptionPlaceholder: msg("What membership unlocks"),
    submit: msg("Create club"),
    footnotes: [FREE],
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
  shell: { title: msg("Create ticket collection"), subtitle: msg("One collection with many tickets.") },
  dialog: { title: msg("Create tickets collection"), workingLabel: msg("Creating your collection…"), firstStepLabel: msg("Prepare metadata") },
  success: { title: msg("Ticket collection created"), description: msg("Each ticket you mint into it is recorded onchain under your wallet."), fallbackName: msg("Your collection"), reward: msg("create_ticket_collection"), againLabel: msg("Create another") },
  cardFallbackSymbol: "Tickets",
  copy: {
    imageHeading: msg("Collection image"),
    nameLabel: msg("Collection name *"),
    namePlaceholder: msg("My tickets"),
    nameHint: msg("Shown on every ticket."),
    symbolPlaceholder: msg("TIX"),
    symbolHint: msg("2 to 10 uppercase letters."),
    descriptionPlaceholder: msg("What the tickets unlock"),
    submit: msg("Create ticket collection"),
    footnotes: [FREE],
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
  shell: { title: msg("Create an edition collection"), subtitle: msg("A collection with many editions per piece.") },
  dialog: { title: msg("Create collection"), workingLabel: msg("Creating your collection…"), firstStepLabel: msg("Prepare metadata") },
  success: { title: msg("Collection created"), description: msg("Each asset you mint into it carries its own license terms."), fallbackName: msg("Your collection"), reward: msg("create_collection"), againLabel: msg("Create another") },
  cardFallbackSymbol: "Editions",
  copy: {
    imageHeading: msg("Collection image"),
    imageHelp: msg("This becomes the cover for your collection."),
    nameLabel: msg("Collection name *"),
    namePlaceholder: msg("My Creative Works"),
    nameHint: msg("The title collectors see."),
    symbolPlaceholder: msg("MCW"),
    symbolHint: msg("2 to 10 uppercase letters."),
    descriptionPlaceholder: msg("Describe your collection and what kind of work it contains…"),
    descriptionHint: msg("The creative direction of the collection."),
    submit: msg("Publish collection"),
    footnotes: [
      FREE,
      msg("Next step: mint pieces into this collection."),
    ],
  },
  suggestSymbol: true,
  registerAfterDeploy: true,
  actions: ({ address, collectionHref }) => ({
    primary: address ? { href: `/launchpad/nfteditions/${address}/mint`, label: msg("Mint tokens") } : undefined,
    secondary: collectionHref ? { href: collectionHref, label: msg("View collection") } : undefined,
  }),
};

export const SINGLE_PRESET: CollectionCreatePreset = {
  service: null,
  icon: Layers,
  iconClass: "text-brand-blue",
  signedOut: { title: msg("Secure your account to create a collection"), description: msg("Set up a collection to mint your work into.") },
  shell: { title: msg("Create a collection"), subtitle: msg("A collection for your work.") },
  dialog: { title: msg("Create collection"), workingLabel: msg("Creating your collection…"), firstStepLabel: msg("Prepare metadata") },
  success: { title: msg("Collection created"), description: msg("Each asset you mint into it carries its own license terms."), fallbackName: msg("Your collection"), reward: msg("create_collection"), againLabel: msg("Create another") },
  cardFallbackSymbol: "Collection",
  copy: {
    imageHeading: msg("Collection image"),
    nameLabel: msg("Collection name *"),
    namePlaceholder: msg("My Creative Works"),
    nameHint: msg("The display name for your collection."),
    symbolPlaceholder: msg("MCW"),
    symbolHint: msg("2 to 10 uppercase letters."),
    descriptionPlaceholder: msg("Describe your collection and what kind of work it contains…"),
    submit: msg("Create collection"),
    footnotes: [FREE],
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => {
    const mint = { href: "/launchpad/single-editions", label: msg("Mint an asset") };
    return collectionHref ? { primary: { href: collectionHref, label: msg("View collection") }, secondary: mint } : { primary: mint };
  },
};
