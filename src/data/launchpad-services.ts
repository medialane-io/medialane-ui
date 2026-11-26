import type { LucideIcon } from "lucide-react";
import {
  ImagePlus, Layers, GitBranch,
  Award, Package,
  Ticket, Users, Handshake,
  Coins, TrendingUp,
  AtSign, FolderInput, Link2,
  LayoutGrid, Boxes,
} from "lucide-react";
import { msg } from "../i18n/translate.js";

export type ServiceStatus = "live" | "building" | "soon";

export type ServiceGroup =
  | "nfts"
  | "collections"
  | "coins"
  | "membership"
  | "licensing"
  | "claims"
  | "coming-soon";

export interface ServiceGroupDefinition {
  key: ServiceGroup;
  title: string;

  tagline?: string;

  badge?: string;
}

export const LAUNCHPAD_SERVICE_GROUPS: ServiceGroupDefinition[] = [
  {
    key: "nfts",
    title: msg("NFTs"),
  },
  {
    key: "collections",
    title: msg("Collections"),
  },
  {
    key: "coins",
    title: msg("Coins"),
  },
  {
    key: "membership",
    title: msg("Membership"),
  },
  {
    key: "licensing",
    title: msg("Licensing"),
  },
  {
    key: "claims",
    title: msg("Claims"),
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
  icon: LucideIcon;
  status: ServiceStatus;
  group: ServiceGroup;

  blurb: string;

  cta: string;

  example?: string;

  format?: { name: string; hint: string };
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    key: "nfts",
    format: { name: msg("Single NFT"), hint: msg("One copy to keep or sell") },
    cta: msg("Create"),
    blurb: msg("Create an immutable NFT with licensing for your content."),
    title: msg("Single NFT"),
    example: msg("A song or a short film"),
    icon: ImagePlus,
    status: "live",
    group: "nfts",
  },
  {
    key: "limited-editions",
    format: { name: msg("Limited Edition NFT"), hint: msg("Multiple copies people can collect") },
    cta: msg("Create"),
    blurb: msg("Create an immutable, licensed NFT in multiple copies for your audience to collect and trade."),
    title: msg("Limited Edition NFT"),
    example: msg("50 copies of a digital print"),
    icon: Layers,
    status: "live",
    group: "nfts",
  },
  {
    key: "remix-asset",
    cta: msg("Browse"),
    blurb: msg("Create a new NFT from an existing one, with its own license and recorded credit to the original."),
    title: msg("NFT Remix"),
    example: msg("A remix of a song"),
    icon: GitBranch,
    status: "live",
    group: "nfts",
  },
  {
    key: "create-collection",
    cta: msg("Create"),
    blurb: msg("Create an onchain collection you own for a series, project or catalog."),
    title: msg("NFT Collection"),
    example: msg("A photography collection"),
    icon: LayoutGrid,
    status: "live",
    group: "collections",
  },
  {
    key: "create-1155",
    cta: msg("Create"),
    blurb: msg("Set up your own contract for releasing multiple limited editions as one series."),
    title: msg("Limited Edition NFT Collection"),
    example: msg("A print series"),
    icon: Boxes,
    status: "live",
    group: "collections",
  },
  {
    key: "collection-drop",
    cta: msg("Launch"),
    blurb: msg("Launch a new collection your audience can get directly from you, for free or at your price."),
    title: msg("NFT Drop"),
    example: msg("A 48-hour NFT drop of 200 pieces at 5 USDC each"),
    icon: Package,
    status: "live",
    group: "collections",
  },
  {
    key: "creator-coins",
    cta: msg("Launch"),
    blurb: msg("Create a coin to build your community, launched with its own liquidity pair."),
    title: msg("Creator Coin"),
    example: msg("A fan coin for a channel"),
    icon: TrendingUp,
    status: "live",
    group: "coins",
  },
  {
    key: "claim-memecoin",
    cta: msg("Claim"),
    blurb: msg("Connect a memecoin you've already launched to your creator profile."),
    title: msg("Existing Memecoin"),
    example: msg("A memecoin on a creator profile"),
    icon: Coins,
    status: "live",
    group: "coins",
  },
  {
    key: "pop-protocol",
    format: { name: msg("Permanent certificate"), hint: msg("Digital certificates of authenticity") },
    cta: msg("Create"),
    blurb: msg("Issue soulbound certificates as lasting proof of participation and achievement."),
    title: msg("POP Protocol"),
    example: msg("Hackathon attendance"),
    icon: Award,
    status: "live",
    group: "membership",
  },
  {
    key: "ip-tickets",
    format: { name: msg("IP Ticket"), hint: msg("Tickets people hold and show at the door") },
    cta: msg("Create"),
    blurb: msg("Create event tickets with verifiable ownership and validity, which holders can resell."),
    title: msg("IP Tickets"),
    icon: Ticket,

    status: "live",
    group: "membership",
  },
  {
    key: "ip-club",
    format: { name: msg("IP Club"), hint: msg("Membership cards for a community") },
    cta: msg("Create"),
    blurb: msg("Create memberships that give your community access to the benefits you offer."),
    title: msg("IP Club"),
    icon: Users,

    status: "live",
    group: "membership",
  },
  {
    key: "ip-sponsorship",
    cta: msg("Create"),
    blurb: msg("Create an onchain deal where a sponsor pays an NFT's creator and receives a license."),
    title: msg("IP Sponsorship"),
    example: msg("Sponsor a song or an artwork for a license"),
    icon: Handshake,

    status: "live",
    group: "licensing",
  },
  {
    key: "claim-username",
    cta: msg("Claim"),
    blurb: msg("Claim your name and get a public creator page to share."),
    title: msg("Username"),
    example: msg("medialane.io/creator/your-name"),
    icon: AtSign,
    status: "live",
    group: "claims",
  },
  {
    key: "claim-collection",
    cta: msg("Claim"),
    blurb: msg("Bring a collection you already own to your profile and manage its page."),
    title: msg("Existing Collection"),
    example: msg("A collection made elsewhere joins a profile"),
    icon: FolderInput,
    status: "live",
    group: "claims",
  },
];

export const COLLECTION_NAME_CLAIM: ServiceDefinition = {
  key: "claim-collection-name",
  cta: msg("Claim"),
  blurb: msg("Give your collection a short, memorable link that's easy to share."),
  title: msg("Collection Address"),
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
  return { ...group, title: t(group.title), tagline: group.tagline && t(group.tagline), badge: group.badge && t(group.badge) };
}

export function localizeService(t: Translate, def: ServiceDefinition): ServiceDefinition {
  return {
    ...def,
    title: t(def.title),
    blurb: t(def.blurb),
    cta: t(def.cta),
    example: def.example && t(def.example),
    format: def.format && { name: t(def.format.name), hint: t(def.format.hint) },
  };
}
