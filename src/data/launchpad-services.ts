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
    title: msg("Single works"),
    tagline: msg("Works, collections and drops."),
  },
  {
    key: "limited-editions",
    title: msg("Limited Editions"),
    tagline: msg("Numbered copies of a work."),
  },
  {
    key: "coins",
    title: msg("Coins"),
    tagline: msg("Launch or claim a coin."),
  },
  {
    key: "membership",
    title: msg("Membership"),
    tagline: msg("Certificates, tickets and club cards."),
  },
  {
    key: "licensing",
    title: msg("Licensing"),
    tagline: msg("Sponsors back work in return for a license."),
  },
  {
    key: "claims",
    title: msg("Claims"),
    tagline: msg("Claim a username or collection."),
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
    format: { name: msg("Single work"), hint: msg("One copy to keep or sell") },
    cta: msg("Create"),
    blurb: msg("Publish each work as a single copy in a creator-owned collection."),
    title: msg("Single work"),
    subtitle: msg("One of a kind"),
    description:
      msg("Publish a single work in a collection."),
    example: msg("A song or a short film"),
    icon: ImagePlus,
    status: "live",
    group: "single-nfts",
  },
  {
    key: "limited-editions",
    format: { name: msg("Limited Editions"), hint: msg("Numbered copies people can collect") },
    cta: msg("Publish"),
    blurb: msg("Release a work in numbered copies that can be collected and traded."),
    title: msg("Limited editions"),
    subtitle: msg("Numbered copies from a creator-owned collection"),
    description:
      msg("Release works in numbered copies."),
    example: msg("50 copies of a limited print"),
    icon: Layers,
    status: "live",
    group: "limited-editions",
  },
  {
    key: "create-collection",
    cta: msg("Create"),
    blurb: msg("Create a collection for single works."),
    title: msg("Collection"),
    subtitle: msg("A collection ready for works"),
    description:
      msg("A creator-owned collection with its own page."),
    example: msg("A photography collection"),
    icon: LayoutGrid,
    status: "live",
    group: "single-nfts",
  },
  {
    key: "remix-asset",
    cta: msg("Browse"),
    blurb: msg("Create from another work with credit."),
    title: msg("Remix a work"),
    subtitle: msg("Remixes with credit to the original"),
    description:
      msg("A licensed remix with credit to the original."),
    example: msg("A remix of a song"),
    icon: GitBranch,
    status: "live",
    group: "single-nfts",
  },

  {
    key: "create-1155",
    cta: msg("Create"),
    blurb: msg("Create a collection for numbered editions."),
    title: msg("Limited Editions Collection"),
    subtitle: msg("A collection ready for editions"),
    description:
      msg("A creator-owned editions collection."),
    example: msg("A print series"),
    icon: Boxes,
    status: "live",
    group: "limited-editions",
  },
  {
    key: "pop-protocol",
    format: { name: msg("Permanent certificate"), hint: msg("Digital certificates of authenticity") },
    cta: msg("Create"),
    blurb: msg("Digital certificates of authenticity."),
    title: msg("POP Protocol"),
    subtitle: msg("Immutable certificates for authenticity"),
    description:
      msg("Permanent certificates that cannot be changed or transferred."),
    example: msg("Hackathon attendance"),
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
    subtitle: msg("Releases with a set opening time"),
    description:
      msg("A timed release with a set price."),
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
    blurb: msg("Create tickets that holders can keep and trade."),
    title: msg("IP Tickets"),
    subtitle: msg("Tickets held in the wallet"),
    description:
      msg("Verifiable tickets for any event."),
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
    subtitle: msg("Membership tiers as cards"),
    description:
      msg("A club with tradable membership cards."),
    icon: Users,
    browseLinkLabel: msg("Browse clubs"),

    status: "live",
    group: "membership",
  },
  {
    key: "ip-sponsorship",
    cta: msg("Browse"),
    blurb: msg("A sponsor backs a work for a license."),
    title: msg("IP Sponsorship"),
    subtitle: msg("Direct sponsorship offers"),
    description:
      msg("Sponsors bid on a work for a license."),
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
    subtitle: msg("A creator-controlled coin"),
    description:
      msg("A coin with a public trading pool."),
    example: msg("A fan coin for a channel"),
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
      msg("List an existing coin on Medialane."),
    example: msg("A memecoin on a creator profile"),
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
      msg("A shareable creator page."),
    example: msg("medialane.io/creator/your-name"),
    icon: AtSign,
    status: "live",
    group: "claims",
  },
  {
    key: "claim-collection",
    cta: msg("Claim"),
    blurb: msg("Bring a collection to a profile."),
    title: msg("Claim collection"),
    subtitle: msg("Bring an already made collection"),
    description:
      msg("Link an existing collection to a profile."),
    example: msg("A collection made elsewhere joins a profile"),
    icon: FolderInput,
    status: "live",
    group: "claims",
  },
];

export const COLLECTION_NAME_CLAIM: ServiceDefinition = {
  key: "claim-collection-name",
  cta: msg("Claim"),
  blurb: msg("A short web address for a collection."),
  title: msg("Claim collection name"),
  subtitle: msg("Reserve a collection page URL"),
  description:
    msg("A custom name for a collection page."),
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
    example: def.example && t(def.example),
    browseLinkLabel: def.browseLinkLabel && t(def.browseLinkLabel),
    format: def.format && { name: t(def.format.name), hint: t(def.format.hint) },
  };
}
