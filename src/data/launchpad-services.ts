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
import { msg } from "../i18n/translate.js";

const TICKETS_TRANSFERABLE_FEATURE = hasCapability("ip-tickets", "transfer")
  ? msg("Freely transferable")
  : msg("Stays with the original holder");

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
    title: msg("Single NFTs"),
    tagline: msg("Singular works, collections, timed drops, and remixes."),
  },
  {
    key: "limited-editions",
    title: msg("Limited Editions"),
    tagline: msg("Numbered copies of a work."),
  },
  {
    key: "coins",
    title: msg("Coins"),
    tagline: msg("Launch a coin, or bring one already made."),
  },
  {
    key: "membership",
    title: msg("Membership"),
    tagline: msg("Immutable certificates, tickets, and club cards."),
  },
  {
    key: "licensing",
    title: msg("Licensing"),
    tagline: msg("Sponsors back work in return for a license."),
  },
  {
    key: "claims",
    title: msg("Claims"),
    tagline: msg("Reserve a username, or bring in an existing collection."),
  },
  {
    key: "coming-soon",
    title: msg("Coming soon"),
    tagline: msg("More ways to earn are on the way."),
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
    format: { name: msg("Single NFT"), hint: msg("One copy to keep or sell") },
    cta: msg("Create"),
    blurb: msg("Publish each work as a single copy in a creator-owned collection."),
    title: msg("Single Edition NFT"),
    subtitle: msg("Each work is minted once"),
    description:
      msg("Publish any photo, video, audio, or document, minted once inside a creator-owned collection. Licensing, provenance, and ownership live on-chain."),
    features: [msg("One mint per work"), msg("Collections with their own page and name"), msg("License terms set by the creator")],
    example: msg("A song, a photo, an ebook, a short film"),
    icon: ImagePlus,
    status: "live",
    group: "single-nfts",
  },
  {
    key: "limited-editions",
    format: { name: msg("Limited Editions"), hint: msg("Numbered copies people can collect") },
    cta: msg("Mint"),
    blurb: msg("Release a work in numbered copies that can be collected and traded."),
    title: msg("Limited Editions NFT"),
    subtitle: msg("Numbered copies from a creator-owned collection"),
    description:
      msg("Create an editions collection and release each work in as many numbered copies as the creator chooses."),
    features: [msg("Numbered copies, set by the creator"), msg("Fans collect and trade"), msg("One home for every release")],
    example: msg("50 copies of a limited print, a music EP in 100 editions"),
    icon: Layers,
    status: "live",
    group: "limited-editions",
  },
  {
    key: "create-collection",
    cta: msg("Create"),
    blurb: msg("Deploy a collection to mint single-edition works into."),
    title: msg("NFT collection"),
    subtitle: msg("An ERC-721 collection, ready to mint into"),
    description:
      msg("Deploy an owned and controlled collection with its own name, symbol, and page. Mint single-edition works into it at any time."),
    features: [msg("Own collection contract"), msg("Set the name and symbol"), msg("Mint into it anytime")],
    example: msg("A photography collection, an album of singles"),
    icon: LayoutGrid,
    status: "live",
    group: "single-nfts",
  },
  {
    key: "remix-asset",
    cta: msg("Browse"),
    blurb: msg("Create from another work. Credit and royalties are handled automatically."),
    title: msg("Remix asset"),
    subtitle: msg("Derivative works with on-chain attribution"),
    description:
      msg("Create a licensed derivative of another work. Attribution and provenance flow back to the original creator."),
    features: [msg("Credit handled automatically"), msg("Royalties flow to the original"), msg("License respected at mint")],
    example: msg("A remix of a song, an artwork inspired by an original"),
    icon: GitBranch,
    status: "live",
    group: "single-nfts",
  },

  {
    key: "create-1155",
    cta: msg("Create"),
    blurb: msg("Deploy a collection to release numbered editions from."),
    title: msg("Limited Editions Collection"),
    subtitle: msg("An ERC-1155 collection, ready for editions"),
    description:
      msg("Deploy an owned and controlled editions collection. Release each work in as many numbered copies as needed."),
    features: [msg("Own collection contract"), msg("Set the name and symbol"), msg("Release editions anytime")],
    example: msg("A print series, a music EP with numbered editions"),
    icon: Boxes,
    status: "live",
    group: "limited-editions",
  },
  {
    key: "pop-protocol",
    format: { name: msg("Immutable certificate"), hint: msg("Digital asset certificates for authenticity") },
    cta: msg("Create"),
    blurb: msg("Digital asset certificates for authenticity."),
    title: msg("POP Protocol"),
    subtitle: msg("Immutable certificates for authenticity"),
    description:
      msg("Permanent certificates that cannot be changed or transferred."),
    features: [msg("Free to claim"), msg("Invite-list gating optional"), msg("Branded claim page to share")],
    example: msg("Hackathon attendance, course completion, conference pass"),
    icon: Award,
    browseLinkLabel: msg("Browse certificates"),
    status: "live",
    group: "membership",
  },
  {
    key: "collection-drop",
    cta: msg("Launch"),
    blurb: msg("Release a limited run at a set price and time window."),
    title: msg("Collection drop"),
    subtitle: msg("Timed NFT releases with mint windows"),
    description:
      msg("Set a price, a supply, and a start and end time. Collectors mint directly from the drop page."),
    features: [msg("Price and supply set by the creator"), msg("Opens and closes on a set schedule"), msg("Branded drop page to share")],
    example: msg("A 48-hour drop of 200 pieces at 5 USDC each"),
    icon: Package,
    browseLinkLabel: msg("Browse drops"),
    status: "live",
    group: "single-nfts",
  },
  {
    key: "ip-tickets",
    format: { name: msg("IP Ticket"), hint: msg("Tickets people hold and show at the door") },
    cta: msg("Create"),
    blurb: msg("Create on-chain tickets that holders can keep and trade."),
    title: msg("IP Tickets"),
    subtitle: msg("Verifiable tickets, held in the wallet"),
    description:
      msg("Create tickets with their own supply and validity window, then mint them to attendees. Every ticket is verifiable on-chain."),
    features: ["Verifiable at the door", "Supply and validity set at creation", TICKETS_TRANSFERABLE_FEATURE],
    icon: Ticket,
    browseLinkLabel: msg("Browse tickets"),

    status: "live",
    group: "membership",
  },
  {
    key: "ip-club",
    format: { name: msg("IP Club"), hint: msg("Membership cards for a community") },
    cta: msg("Create"),
    blurb: msg("Membership cards for a community."),
    title: msg("IP Club"),
    subtitle: msg("Membership tiers, minted as cards"),
    description:
      msg("Create a club with membership tiers — fans, supporters, press, season passes. Mint the cards and sell them like any collection."),
    features: [msg("Membership tiers"), msg("Optional validity window"), msg("Trade like any collection")],
    icon: Users,
    browseLinkLabel: msg("Browse clubs"),

    status: "live",
    group: "membership",
  },
  {
    key: "ip-sponsorship",
    cta: msg("Browse"),
    blurb: msg("Let a sponsor back a work directly, for a license in return."),
    title: msg("IP Sponsorship"),
    subtitle: msg("Direct sponsorship offers, settled asset-to-asset"),
    description:
      msg("Create a sponsorship offer on an owned asset. Sponsors bid, the owner accepts, and the sponsor receives a license. Payment settles directly between sponsor and author."),
    features: [msg("Direct settlement"), msg("Owner-verified on-chain"), msg("Open bidding or one invited sponsor")],
    example: msg("Sponsor a song or an artwork for a license"),
    icon: Handshake,
    browseLinkLabel: msg("Browse offers"),

    status: "live",
    group: "licensing",
  },

  {
    key: "creator-coins",
    cta: msg("Launch"),
    blurb: msg("Launch a coin in a few clicks and stay in control of it."),
    title: msg("Creator coin"),
    subtitle: msg("A coin and its liquidity, under creator control"),
    description:
      msg("Launch a coin with a public trading pool. The creator sets the supply and allocation and stays in control of the liquidity."),
    features: [msg("Launch in a few clicks"), msg("Creator keeps control of the liquidity"), msg("Traded on a public pool")],
    example: msg("A fan coin for a channel, a coin for a music project"),
    icon: TrendingUp,
    status: "live",
    group: "coins",
  },

  {
    key: "claim-memecoin",
    cta: msg("Claim"),
    blurb: msg("Add an already launched coin to a profile."),
    title: msg("Claim memecoin"),
    subtitle: msg("Bring an already launched coin"),
    description:
      msg("Claim an already launched coin to list it on the Coins page and a profile. Claims are reviewed before going live."),
    features: [msg("Bring an already launched coin"), msg("Reviewed by our team"), msg("Featured on the Coins page")],
    example: msg("An unrug memecoin, listed on a creator profile"),
    icon: Coins,
    status: "live",
    group: "coins",
  },
  {
    key: "claim-username",
    cta: msg("Claim"),
    blurb: msg("Reserve a name and get a creator page of its own."),
    title: msg("Claim username"),
    subtitle: msg("Reserve a creator page URL"),
    description:
      msg("Claim a username to get a shareable creator page, a public portfolio at a clean, memorable URL."),
    features: [msg("Free claim"), msg("Shareable creator page"), msg("Public portfolio")],
    example: msg("medialane.io/creator/your-name — a portfolio at its own name"),
    icon: AtSign,
    status: "live",
    group: "claims",
  },
  {
    key: "claim-collection",
    cta: msg("Claim"),
    blurb: msg("Made a collection somewhere else? Bring it to a profile."),
    title: msg("Claim collection"),
    subtitle: msg("Bring an already made collection"),
    description:
      msg("Claim a collection made elsewhere to link it to a profile and give it a branded collection page."),
    features: [msg("Bring an existing collection"), msg("Linked to a profile"), msg("Branded collection page")],
    example: msg("A collection made elsewhere joins a profile"),
    icon: FolderInput,
    status: "live",
    group: "claims",
  },
];

export const COLLECTION_NAME_CLAIM: ServiceDefinition = {
  key: "claim-collection-name",
  cta: msg("Claim"),
  blurb: msg("Give a collection a clean, memorable web address of its own."),
  title: msg("Claim collection name"),
  subtitle: msg("Reserve a collection page URL"),
  description:
    msg("Claim a custom name for a collection page and get a clean, shareable URL instead of a long technical address."),
  features: [msg("Free claim"), msg("Clean shareable URL"), msg("Easy to remember and share")],
  example: msg("medialane.io/collection/your-collection"),
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

type Translate = (text: string) => string;

export function localizeGroup(t: Translate, group: ServiceGroupDefinition): ServiceGroupDefinition {
  return { ...group, title: t(group.title), tagline: t(group.tagline), badge: group.badge && t(group.badge) };
}

export function localizeService(t: Translate, def: ServiceDefinition): ServiceDefinition {
  return {
    ...def,
    title: t(def.title),
    subtitle: t(def.subtitle),
    description: t(def.description),
    blurb: t(def.blurb),
    cta: t(def.cta),
    features: def.features.map((feature) => t(feature)),
    example: def.example && t(def.example),
    browseLinkLabel: def.browseLinkLabel && t(def.browseLinkLabel),
    format: def.format && { name: t(def.format.name), hint: t(def.format.hint) },
  };
}
