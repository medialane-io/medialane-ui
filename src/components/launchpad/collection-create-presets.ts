import { Layers, Ticket, Users } from "lucide-react";
import type { ElementType } from "react";

export interface CollectionCreateAction {
  href: string;
  label: string;
}

export interface CollectionCreatePreset {
  service: "ip-club" | "ip-tickets" | "mip-erc1155" | null;
  icon: ElementType;
  iconClass: string;
  buttonClass: string;
  signedOut: { title: string; description: string };
  shell: { title: string; subtitle: string };
  dialog: { title: string; workingLabel: string; firstStepLabel: string };
  success: { caption: string; fallbackName: string; reward: string; againLabel: string };
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

const FREE = "Free to publish — protocol fee is zero.";

export const CLUB_PRESET: CollectionCreatePreset = {
  service: "ip-club",
  icon: Users,
  iconClass: "text-brand-purple",
  buttonClass: "bg-brand-purple",
  signedOut: { title: "Secure your account to create a club", description: "Create a club, then mint membership cards for your community." },
  shell: { title: "Create Club", subtitle: "One club — create membership tiers and mint cards to your community." },
  dialog: { title: "Create club", workingLabel: "Creating your club…", firstStepLabel: "Prepare metadata" },
  success: { caption: "Your club is live", fallbackName: "Your club", reward: "create_club", againLabel: "Create another" },
  cardFallbackSymbol: "Club",
  copy: {
    imageHeading: "Club image",
    nameLabel: "Club name *",
    namePlaceholder: "My Club",
    nameHint: "Shown in wallets, explorers, and on every membership card.",
    symbolPlaceholder: "CLUB",
    symbolHint: "Short ticker — 2 to 10 uppercase letters.",
    descriptionPlaceholder: "Describe your club — what does membership unlock?",
    submit: "Create Club",
    footnotes: [FREE],
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => ({ primary: collectionHref ? { href: collectionHref, label: "Create memberships" } : undefined }),
};

export const TICKETS_PRESET: CollectionCreatePreset = {
  service: "ip-tickets",
  icon: Ticket,
  iconClass: "text-teal-500",
  buttonClass: "bg-teal-600",
  signedOut: { title: "Secure your account to create tickets", description: "Create a tickets collection, then mint tickets to your audience." },
  shell: { title: "Create Ticket Collection", subtitle: "One collection — create tickets and mint them to your audience." },
  dialog: { title: "Create tickets collection", workingLabel: "Creating your collection…", firstStepLabel: "Prepare metadata" },
  success: { caption: "Your collection is live", fallbackName: "Your collection", reward: "create_ticket_collection", againLabel: "Create another" },
  cardFallbackSymbol: "Tickets",
  copy: {
    imageHeading: "Collection image",
    nameLabel: "Collection name *",
    namePlaceholder: "My Tickets",
    nameHint: "Shown in wallets, explorers, and on every ticket.",
    symbolPlaceholder: "TIX",
    symbolHint: "Short ticker — 2 to 10 uppercase letters.",
    descriptionPlaceholder: "Describe your tickets — what do they admit or unlock?",
    submit: "Create Ticket Collection",
    footnotes: [FREE],
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => ({ primary: collectionHref ? { href: collectionHref, label: "Create tickets" } : undefined }),
};

export const EDITIONS_PRESET: CollectionCreatePreset = {
  service: "mip-erc1155",
  icon: Layers,
  iconClass: "text-brand-purple",
  buttonClass: "bg-brand-purple",
  signedOut: { title: "Secure your account to create a collection", description: "Create a collection where each piece can have multiple editions." },
  shell: { title: "Create an Edition Collection", subtitle: "Create a collection where each piece can have multiple editions — free to publish, and it's yours." },
  dialog: { title: "Create collection", workingLabel: "Creating your collection…", firstStepLabel: "Prepare metadata" },
  success: { caption: "Your collection is live", fallbackName: "Your collection", reward: "create_collection", againLabel: "Create another" },
  cardFallbackSymbol: "Editions",
  copy: {
    imageHeading: "Collection image",
    imageHelp: "This becomes the cover for your collection.",
    nameLabel: "Collection name *",
    namePlaceholder: "My Creative Works",
    nameHint: "The main title collectors see across the collection page, wallets, and future listings.",
    symbolPlaceholder: "MCW",
    symbolHint: "Short ticker (2–10 uppercase letters). We suggest one from the collection name.",
    descriptionPlaceholder: "Describe your collection and what kind of work it contains…",
    descriptionHint: "Use this to explain the creative direction, media type, or audience for the collection.",
    submit: "Publish Collection",
    footnotes: [
      FREE,
      "Next step: mint pieces into this collection — you set the number of copies for each piece when you mint it, and can add more copies later.",
    ],
  },
  suggestSymbol: true,
  registerAfterDeploy: true,
  actions: ({ address, collectionHref }) => ({
    primary: address ? { href: `/launchpad/nfteditions/${address}/mint`, label: "Mint tokens" } : undefined,
    secondary: collectionHref ? { href: collectionHref, label: "View collection" } : undefined,
  }),
};

export const SINGLE_PRESET: CollectionCreatePreset = {
  service: null,
  icon: Layers,
  iconClass: "text-brand-blue",
  buttonClass: "bg-brand-blue",
  signedOut: { title: "Secure your account to create a collection", description: "Set up a collection to mint your work into." },
  shell: { title: "Create a Collection", subtitle: "Set up a collection to mint your work into — free to publish, and it's yours." },
  dialog: { title: "Create collection", workingLabel: "Creating your collection…", firstStepLabel: "Prepare metadata" },
  success: { caption: "Your collection is live", fallbackName: "Your collection", reward: "create_collection", againLabel: "Create another" },
  cardFallbackSymbol: "Collection",
  copy: {
    imageHeading: "Collection image",
    nameLabel: "Collection name *",
    namePlaceholder: "My Creative Works",
    nameHint: "The display name for your collection.",
    symbolPlaceholder: "MCW",
    symbolHint: "Short ticker (2–10 uppercase letters). Shown in wallets and marketplaces.",
    descriptionPlaceholder: "Describe your collection and what kind of work it contains…",
    submit: "Create collection",
    footnotes: [FREE],
  },
  suggestSymbol: false,
  registerAfterDeploy: false,
  actions: ({ collectionHref }) => ({
    primary: { href: "/launchpad/single-editions", label: "Mint an asset" },
    secondary: collectionHref ? { href: collectionHref, label: "View collection" } : undefined,
  }),
};
