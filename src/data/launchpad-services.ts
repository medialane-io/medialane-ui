import type { LucideIcon } from "lucide-react";
import {
  ImagePlus, Layers, GitBranch,
  Award, Package,
  Ticket, Users, Handshake,
  Coins, TrendingUp,
  AtSign, FolderInput, Link2,
} from "lucide-react";
import { hasCapability } from "@medialane/sdk";

const TICKETS_TRANSFERABLE_FEATURE = hasCapability("ip-tickets", "transfer")
  ? "Freely transferable"
  : "Stays with the original holder";

export type ServiceStatus = "live" | "building" | "soon";

export type ServiceGroup =
  | "nfts"
  | "limited-editions"
  | "coins"
  | "community"
  | "claims"
  | "coming-soon";

export interface ServiceGroupDefinition {
  key: ServiceGroup;
  title: string;
  /** One line of plain creator language: what does this group do for my portfolio/revenue? */
  tagline: string;
  /** Optional small chip next to the title (e.g. the token standard) */
  badge?: string;
}

/** Ordered — drives the filter pills and the grid's tag order. */
export const LAUNCHPAD_SERVICE_GROUPS: ServiceGroupDefinition[] = [
  {
    key: "nfts",
    title: "NFTs",
    tagline: "Singular works, your own collections, timed drops, and remixes.",
  },
  {
    key: "limited-editions",
    title: "Limited Editions",
    tagline: "Numbered copies of your work.",
  },
  {
    key: "coins",
    title: "Coins",
    tagline: "Launch your own coin, or bring one you already made.",
  },
  {
    key: "community",
    title: "Community",
    tagline: "Badges, tickets, memberships, and direct sponsorship.",
  },
  {
    key: "claims",
    title: "Claims",
    tagline: "Reserve your username, your collection's name, or bring in a collection you already made.",
  },
  {
    key: "coming-soon",
    title: "Coming soon",
    tagline: "More ways to earn are on the way.",
  },
];

/** All colors on launchpad surfaces come from the design system: the group
 *  accents in `GROUP_SLICES` / `SERVICE_HUES` (brand tokens only). Service
 *  definitions carry NO style fields — content only. */
export interface ServiceDefinition {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  status: ServiceStatus;
  group: ServiceGroup;
  /** The ONE creator-language sentence the card shows (no jargon). */
  blurb: string;
  /** Single-verb action label (never repeats the title). */
  cta: string;
  /** Concrete usage example (legacy long-card layout; unused by the current card). */
  example?: string;
  /** Secondary browse link label — injected app adds the href */
  browseLinkLabel?: string;
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  // ── Create ────────────────────────────────────────────────────────────────
  {
    key: "nfts",
    cta: "Create",
    blurb: "Publish each work as a single copy in a collection you own.",
    title: "Single Editions",
    subtitle: "Each work is minted once",
    description:
      "Publish any photo, video, audio, or document, minted once inside your collection. Licensing, provenance, and ownership live on-chain.",
    features: ["One mint per work", "Collections with their own page and name", "You set the license terms"],
    example: "A song, a photo, an ebook, a short film",
    icon: ImagePlus,
    status: "live",
    group: "nfts",
  },
  {
    key: "limited-editions",
    cta: "Mint",
    blurb: "Release your work in numbered copies that can be collected and traded.",
    title: "Limited Editions",
    subtitle: "Numbered copies from a collection you own",
    description:
      "Create an editions collection and release each work in as many numbered copies as you choose.",
    features: ["Numbered copies, set by you", "Fans collect and trade", "One home for every release"],
    example: "50 copies of a limited print, a music EP in 100 editions",
    icon: Layers,
    status: "live",
    group: "limited-editions",
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
    group: "nfts",
  },

  // ── Launch ────────────────────────────────────────────────────────────────
  {
    key: "pop-protocol",
    cta: "Create",
    blurb: "Badges your community claims and keeps forever.",
    title: "POP Protocol",
    subtitle: "Proof-of-participation badges for your community",
    description:
      "Give out permanent badges. Each person can claim one, and it cannot be transferred or faked.",
    features: ["Free for your community to claim", "Invite-list gating optional", "Branded claim page to share"],
    example: "Hackathon attendance badge, community membership, conference pass",
    icon: Award,
    browseLinkLabel: "Browse badges",
    status: "live",
    group: "community",
  },
  {
    key: "collection-drop",
    cta: "Launch",
    blurb: "Release a limited run at a set price and time window.",
    title: "Collection Drop",
    subtitle: "Timed NFT releases with mint windows",
    description:
      "Set a price, a supply, and a start and end time. Collectors mint directly from your drop page.",
    features: ["You set price and supply", "Opens and closes on your schedule", "Branded drop page to share"],
    example: "A 48-hour drop of 200 pieces at 5 USDC each",
    icon: Package,
    browseLinkLabel: "Browse drops",
    status: "live",
    group: "nfts",
  },
  {
    key: "ip-tickets",
    cta: "Create",
    blurb: "Create on-chain tickets your audience can hold and trade.",
    title: "IP Tickets",
    subtitle: "Verifiable tickets, held in the wallet",
    description:
      "Create tickets with their own supply and validity window, then mint them to attendees. Every ticket is verifiable on-chain.",
    features: ["Verifiable at the door", "Supply and validity you set", TICKETS_TRANSFERABLE_FEATURE],
    icon: Ticket,
    browseLinkLabel: "Browse tickets",
    // Deployed to Starknet mainnet 2026-07-02 — see
    // medialane-core/docs/deployments.md
    status: "live",
    group: "community",
  },
  {
    key: "ip-club",
    cta: "Create",
    blurb: "Membership cards for your community.",
    title: "IP Club",
    subtitle: "Membership tiers, minted as cards",
    description:
      "Create a club with membership tiers — fans, supporters, press, season passes. Mint the cards and sell them like any collection.",
    features: ["Membership tiers", "Optional validity window", "Trade like any collection"],
    icon: Users,
    browseLinkLabel: "Browse clubs",
    // Deployed to Starknet mainnet 2026-07-02 — see
    // medialane-core/docs/deployments.md
    status: "live",
    group: "community",
  },
  {
    key: "ip-sponsorship",
    cta: "Browse",
    blurb: "Let a sponsor back your work directly, for a license in return.",
    title: "IP Sponsorship",
    subtitle: "Direct sponsorship offers, settled asset-to-asset",
    description:
      "Create a sponsorship offer on an asset you own. Sponsors bid, you accept, and they receive a license. Payment settles directly between sponsor and author.",
    features: ["Direct settlement", "Owner-verified on-chain", "Open bidding or one invited sponsor"],
    example: "Sponsor a song, an artwork, or a patent for a license",
    icon: Handshake,
    browseLinkLabel: "Browse offers",
    // Deployed to Starknet mainnet 2026-07-02 — see
    // medialane-core/docs/deployments.md
    status: "live",
    group: "community",
  },

  // ── Monetize ─────────────────────────────────────────────────────────────
  {
    key: "creator-coins",
    cta: "Launch",
    blurb: "Launch your coin in a few clicks and stay in control of it.",
    title: "Creator Coin",
    subtitle: "Your own coin, your liquidity",
    description:
      "Launch your own coin with a public trading pool. You set the supply and allocation and stay in control of the liquidity.",
    features: ["Launch in a few clicks", "You keep control of the liquidity", "Traded on a public pool"],
    example: "A fan coin for your channel, a coin for your music project",
    icon: TrendingUp,
    status: "live",
    group: "coins",
  },

  // ── Claims ────────────────────────────────────────────────────────────────
  {
    key: "claim-memecoin",
    cta: "Claim",
    blurb: "Add a coin you already launched to your profile.",
    title: "Claim Memecoin",
    subtitle: "Bring a coin you already launched",
    description:
      "Claim a coin you already launched to list it on the Coins page and your profile. Claims are reviewed before going live.",
    features: ["Bring a coin you already launched", "Reviewed by our team", "Featured on the Coins page"],
    example: "Your unrug memecoin, listed on your creator profile",
    icon: Coins,
    status: "live",
    group: "coins",
  },
  {
    key: "claim-username",
    cta: "Claim",
    blurb: "Reserve your name and get your own creator page.",
    title: "Claim Username",
    subtitle: "Reserve your creator page URL",
    description:
      "Claim your username to get a shareable creator page, your public portfolio at a clean, memorable URL.",
    features: ["Free claim", "Shareable creator page", "Your public portfolio"],
    example: "medialane.io/your-name — your portfolio at your own name",
    icon: AtSign,
    status: "live",
    group: "claims",
  },
  {
    key: "claim-collection",
    cta: "Claim",
    blurb: "Made a collection somewhere else? Bring it to your profile.",
    title: "Claim Collection",
    subtitle: "Bring a collection you already made",
    description:
      "Claim a collection you made elsewhere to link it to your profile and give it a branded collection page.",
    features: ["Bring an existing collection", "Linked to your profile", "Branded collection page"],
    example: "A collection you made elsewhere joins your profile",
    icon: FolderInput,
    status: "live",
    group: "claims",
  },
  {
    key: "claim-collection-name",
    cta: "Claim",
    blurb: "Give your collection a clean, memorable web address of its own.",
    title: "Claim Collection Name",
    subtitle: "Reserve your collection page URL",
    description:
      "Claim a custom name for your collection page and get a clean, shareable URL instead of a long technical address.",
    features: ["Free claim", "Clean shareable URL", "Easy to remember and share"],
    example: "medialane.io/collections/your-collection",
    icon: Link2,
    status: "live",
    group: "claims",
  },
];
