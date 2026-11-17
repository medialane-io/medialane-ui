import type { LucideIcon } from "lucide-react";
import {
  ImagePlus, Layers, GitBranch,
  Award, Package,
  Ticket, Users, Handshake,
  Coins, TrendingUp,
  AtSign, FolderInput, Link2,
  LayoutGrid, Boxes,
} from "lucide-react";
import { hasCapability } from "@medialane/sdk";

const TICKETS_TRANSFERABLE_FEATURE = hasCapability("ip-tickets", "transfer")
  ? "Freely transferable"
  : "Stays with the original holder";

export type ServiceStatus = "live" | "building" | "soon";

export type ServiceGroup =
  | "single-nfts"
  | "limited-editions"
  | "coins"
  | "membership"
  | "licensing"
  | "claims"
  | "coming-soon";

export interface ServiceGroupDefinition {
  key: ServiceGroup;
  title: string;

  tagline: string;

  badge?: string;
}

export const LAUNCHPAD_SERVICE_GROUPS: ServiceGroupDefinition[] = [
  {
    key: "single-nfts",
    title: "Single NFTs",
    tagline: "Singular works, collections, timed drops, and remixes.",
  },
  {
    key: "limited-editions",
    title: "Limited Editions",
    tagline: "Numbered copies of a work.",
  },
  {
    key: "coins",
    title: "Coins",
    tagline: "Launch a coin, or bring one already made.",
  },
  {
    key: "membership",
    title: "Membership",
    tagline: "Immutable certificates, tickets, and club cards.",
  },
  {
    key: "licensing",
    title: "Licensing",
    tagline: "Sponsors back work in return for a license.",
  },
  {
    key: "claims",
    title: "Claims",
    tagline: "Reserve a username, or bring in an existing collection.",
  },
  {
    key: "coming-soon",
    title: "Coming soon",
    tagline: "More ways to earn are on the way.",
  },
];

export interface ServiceDefinition {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  status: ServiceStatus;
  group: ServiceGroup;

  blurb: string;

  cta: string;

  example?: string;

  browseLinkLabel?: string;

  format?: { name: string; hint: string };
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [

  {
    key: "nfts",
    format: { name: "Single NFT", hint: "One copy to keep or sell" },
    cta: "Create",
    blurb: "Publish each work as a single copy in a creator-owned collection.",
    title: "Single Edition NFT",
    subtitle: "Each work is minted once",
    description:
      "Publish any photo, video, audio, or document, minted once inside a creator-owned collection. Licensing, provenance, and ownership live on-chain.",
    features: ["One mint per work", "Collections with their own page and name", "License terms set by the creator"],
    example: "A song, a photo, an ebook, a short film",
    icon: ImagePlus,
    status: "live",
    group: "single-nfts",
  },
  {
    key: "limited-editions",
    format: { name: "Limited Editions", hint: "Numbered copies people can collect" },
    cta: "Mint",
    blurb: "Release a work in numbered copies that can be collected and traded.",
    title: "Limited Editions NFT",
    subtitle: "Numbered copies from a creator-owned collection",
    description:
      "Create an editions collection and release each work in as many numbered copies as the creator chooses.",
    features: ["Numbered copies, set by the creator", "Fans collect and trade", "One home for every release"],
    example: "50 copies of a limited print, a music EP in 100 editions",
    icon: Layers,
    status: "live",
    group: "limited-editions",
  },
  {
    key: "create-collection",
    cta: "Create",
    blurb: "Deploy a collection to mint single-edition works into.",
    title: "NFT Collection",
    subtitle: "An ERC-721 collection, ready to mint into",
    description:
      "Deploy an owned and controlled collection with its own name, symbol, and page. Mint single-edition works into it at any time.",
    features: ["Own collection contract", "Set the name and symbol", "Mint into it anytime"],
    example: "A photography collection, an album of singles",
    icon: LayoutGrid,
    status: "live",
    group: "single-nfts",
  },
  {
    key: "remix-asset",
    cta: "Browse",
    blurb: "Create from another work. Credit and royalties are handled automatically.",
    title: "Remix Asset",
    subtitle: "Derivative works with on-chain attribution",
    description:
      "Create a licensed derivative of another work. Attribution and provenance flow back to the original creator.",
    features: ["Credit handled automatically", "Royalties flow to the original", "License respected at mint"],
    example: "A remix of a song, an artwork inspired by an original",
    icon: GitBranch,
    status: "live",
    group: "single-nfts",
  },

  {
    key: "create-1155",
    cta: "Create",
    blurb: "Deploy a collection to release numbered editions from.",
    title: "Limited Editions Collection",
    subtitle: "An ERC-1155 collection, ready for editions",
    description:
      "Deploy an owned and controlled editions collection. Release each work in as many numbered copies as needed.",
    features: ["Own collection contract", "Set the name and symbol", "Release editions anytime"],
    example: "A print series, a music EP with numbered editions",
    icon: Boxes,
    status: "live",
    group: "limited-editions",
  },
  {
    key: "pop-protocol",
    format: { name: "Immutable certificate", hint: "Digital asset certificates for authenticity" },
    cta: "Create",
    blurb: "Digital asset certificates for authenticity.",
    title: "POP Protocol",
    subtitle: "Immutable certificates for authenticity",
    description:
      "Permanent certificates that cannot be changed or transferred.",
    features: ["Free to claim", "Invite-list gating optional", "Branded claim page to share"],
    example: "Hackathon attendance, course completion, conference pass",
    icon: Award,
    browseLinkLabel: "Browse certificates",
    status: "live",
    group: "membership",
  },
  {
    key: "collection-drop",
    cta: "Launch",
    blurb: "Release a limited run at a set price and time window.",
    title: "Collection Drop",
    subtitle: "Timed NFT releases with mint windows",
    description:
      "Set a price, a supply, and a start and end time. Collectors mint directly from the drop page.",
    features: ["Price and supply set by the creator", "Opens and closes on a set schedule", "Branded drop page to share"],
    example: "A 48-hour drop of 200 pieces at 5 USDC each",
    icon: Package,
    browseLinkLabel: "Browse drops",
    status: "live",
    group: "single-nfts",
  },
  {
    key: "ip-tickets",
    format: { name: "IP Ticket", hint: "Tickets people hold and show at the door" },
    cta: "Create",
    blurb: "Create on-chain tickets that holders can keep and trade.",
    title: "IP Tickets",
    subtitle: "Verifiable tickets, held in the wallet",
    description:
      "Create tickets with their own supply and validity window, then mint them to attendees. Every ticket is verifiable on-chain.",
    features: ["Verifiable at the door", "Supply and validity set at creation", TICKETS_TRANSFERABLE_FEATURE],
    icon: Ticket,
    browseLinkLabel: "Browse tickets",

    status: "live",
    group: "membership",
  },
  {
    key: "ip-club",
    format: { name: "IP Club", hint: "Membership cards for a community" },
    cta: "Create",
    blurb: "Membership cards for a community.",
    title: "IP Club",
    subtitle: "Membership tiers, minted as cards",
    description:
      "Create a club with membership tiers — fans, supporters, press, season passes. Mint the cards and sell them like any collection.",
    features: ["Membership tiers", "Optional validity window", "Trade like any collection"],
    icon: Users,
    browseLinkLabel: "Browse clubs",

    status: "live",
    group: "membership",
  },
  {
    key: "ip-sponsorship",
    cta: "Browse",
    blurb: "Let a sponsor back a work directly, for a license in return.",
    title: "IP Sponsorship",
    subtitle: "Direct sponsorship offers, settled asset-to-asset",
    description:
      "Create a sponsorship offer on an owned asset. Sponsors bid, the owner accepts, and the sponsor receives a license. Payment settles directly between sponsor and author.",
    features: ["Direct settlement", "Owner-verified on-chain", "Open bidding or one invited sponsor"],
    example: "Sponsor a song or an artwork for a license",
    icon: Handshake,
    browseLinkLabel: "Browse offers",

    status: "live",
    group: "licensing",
  },

  {
    key: "creator-coins",
    cta: "Launch",
    blurb: "Launch a coin in a few clicks and stay in control of it.",
    title: "Creator Coin",
    subtitle: "A coin and its liquidity, under creator control",
    description:
      "Launch a coin with a public trading pool. The creator sets the supply and allocation and stays in control of the liquidity.",
    features: ["Launch in a few clicks", "Creator keeps control of the liquidity", "Traded on a public pool"],
    example: "A fan coin for a channel, a coin for a music project",
    icon: TrendingUp,
    status: "live",
    group: "coins",
  },

  {
    key: "claim-memecoin",
    cta: "Claim",
    blurb: "Add an already launched coin to a profile.",
    title: "Claim Memecoin",
    subtitle: "Bring an already launched coin",
    description:
      "Claim an already launched coin to list it on the Coins page and a profile. Claims are reviewed before going live.",
    features: ["Bring an already launched coin", "Reviewed by our team", "Featured on the Coins page"],
    example: "An unrug memecoin, listed on a creator profile",
    icon: Coins,
    status: "live",
    group: "coins",
  },
  {
    key: "claim-username",
    cta: "Claim",
    blurb: "Reserve a name and get a creator page of its own.",
    title: "Claim Username",
    subtitle: "Reserve a creator page URL",
    description:
      "Claim a username to get a shareable creator page, a public portfolio at a clean, memorable URL.",
    features: ["Free claim", "Shareable creator page", "Public portfolio"],
    example: "medialane.io/creator/your-name — a portfolio at its own name",
    icon: AtSign,
    status: "live",
    group: "claims",
  },
  {
    key: "claim-collection",
    cta: "Claim",
    blurb: "Made a collection somewhere else? Bring it to a profile.",
    title: "Claim Collection",
    subtitle: "Bring an already made collection",
    description:
      "Claim a collection made elsewhere to link it to a profile and give it a branded collection page.",
    features: ["Bring an existing collection", "Linked to a profile", "Branded collection page"],
    example: "A collection made elsewhere joins a profile",
    icon: FolderInput,
    status: "live",
    group: "claims",
  },
];

export const COLLECTION_NAME_CLAIM: ServiceDefinition = {
  key: "claim-collection-name",
  cta: "Claim",
  blurb: "Give a collection a clean, memorable web address of its own.",
  title: "Claim Collection Name",
  subtitle: "Reserve a collection page URL",
  description:
    "Claim a custom name for a collection page and get a clean, shareable URL instead of a long technical address.",
  features: ["Free claim", "Clean shareable URL", "Easy to remember and share"],
  example: "medialane.io/collection/your-collection",
  icon: Link2,
  status: "live",
  group: "claims",
};

export function getLaunchpadService(key: string): ServiceDefinition {
  const found = LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === key);
  if (!found) throw new Error(`Unknown launchpad service: ${key}`);
  return found;
}

export function getMintFormatCopy(key: string): { name: string; hint: string } {
  const format = getLaunchpadService(key).format;
  if (!format) throw new Error(`Launchpad service has no mint format: ${key}`);
  return format;
}
