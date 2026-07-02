import type { LucideIcon } from "lucide-react";
import {
  ImagePlus, Layers, GitBranch,
  Award, Package, PlusCircle,
  Ticket, Users,
  RefreshCw, Coins, TrendingUp,
  AtSign, FolderInput, Link2,
} from "lucide-react";

export type ServiceStatus = "live" | "building" | "soon";
export type ServiceCategory = "create" | "launch" | "monetize";

export type ServiceGroup =
  | "single-edition"
  | "limited-editions"
  | "creator-coins"
  | "collection-drop"
  | "pop-protocol"
  | "ip-tickets"
  | "ip-club"
  | "licensing-remix"
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

/** Ordered — launchpad pages render sections in this order. */
export const LAUNCHPAD_SERVICE_GROUPS: ServiceGroupDefinition[] = [
  {
    key: "single-edition",
    title: "Single Editions",
    tagline: "Publish one-of-a-kind pieces \u2014 a song, a photo, a film \u2014 under your own name.",
  },
  {
    key: "limited-editions",
    title: "Limited Editions",
    tagline: "Release your work in numbered copies your fans can collect and trade.",
  },
  {
    key: "creator-coins",
    title: "Creator Coins & Memecoins",
    tagline: "Launch your own coin — or bring one you already made — and let your community back you.",
  },
  {
    key: "collection-drop",
    title: "Collection Drop",
    tagline: "Schedule a release and let your audience mint while the window is open.",
  },
  {
    key: "pop-protocol",
    title: "POP Protocol",
    tagline: "Give your community proof they were part of the moment.",
  },
  {
    key: "ip-tickets",
    title: "IP Tickets",
    tagline: "Sell tickets to your shows and events, verifiable on-chain.",
  },
  {
    key: "ip-club",
    title: "IP Club",
    tagline: "Give your closest fans a membership card that unlocks more.",
  },
  {
    key: "licensing-remix",
    title: "Licensing & Remix",
    tagline: "Let others build on your work \u2014 with credit and royalties flowing back to you.",
  },
  {
    key: "claims",
    title: "Claims",
    tagline: "Quick wins \u2014 claim your name and bring in work you have already made.",
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
  gradient: string;
  borderColor: string;
  iconColor: string;
  buttonColor?: string;
  badge: string;
  status: ServiceStatus;
  category: ServiceCategory;
  group: ServiceGroup;
  /** The ONE creator-language sentence the card shows (no jargon). */
  blurb: string;
  /** Single-verb action label for the card's gradient pill (never repeats the title). */
  cta: string;
  /** Concrete usage example (legacy long-card layout; unused by the 0.9.0 card). */
  example?: string;
  /** Secondary browse link label — injected app adds the href */
  browseLinkLabel?: string;
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  // ── Create ────────────────────────────────────────────────────────────────
  {
    key: "mint-ip-asset",
    cta: "Mint",
    blurb: "Upload a song, a photo, a video \u2014 any file \u2014 and publish it as yours, free, in minutes.",
    title: "Mint singular NFT",
    subtitle: "Publish your creative work onchain",
    description:
      "Upload any photo, video, audio, or document and mint it as an IP NFT — with licensing, provenance, and ownership all locked on-chain.",
    // Apps may override features[0] with their gasless-rail wording (ChipiPay/AVNU).
    features: ["Free to publish", "Your file, stored forever", "You set the license terms"],
    example: "A song, a photo, an ebook, a short film",
    icon: ImagePlus,
    gradient: "from-blue-500/10 via-sky-400/4 to-transparent",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    buttonColor: "bg-brand-blue hover:bg-brand-blue/90",
    badge: "Create",
    status: "live",
    category: "create",
    group: "single-edition",
  },
  {
    key: "create-collection",
    cta: "Create",
    blurb: "Give your works a home of their own, with its own page and name.",
    title: "Create NFT Collection",
    subtitle: "Group your NFTs under a shared identity",
    description:
      "Deploy a branded ERC-721 collection with its own page and on-chain identity. Add assets to it at any time and share it with collectors.",
    features: ["Your own branded page", "Add new work anytime", "One link to share with fans"],
    example: "A photography portfolio, a music catalog, a comic series",
    icon: Layers,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-brand-purple hover:bg-brand-purple/90",
    badge: "Create",
    status: "live",
    category: "create",
    group: "single-edition",
  },
  {
    key: "ip-collection-1155",
    cta: "Create",
    blurb: "Set up a collection made for numbered copies of your work.",
    title: "Limited Editions Collections",
    subtitle: "Deploy a contract for multi-copy NFT releases",
    description:
      "Create a collection built for editions — release music tracks, art prints, or any IP in numbered multiples. Each edition token is tradeable on Medialane.",
    features: ["Numbered copies, set by you", "Fans collect and trade", "One home for every release"],
    example: "50 copies of a limited print, a music EP in 100 editions",
    icon: Layers,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-violet-600 hover:bg-violet-700",
    badge: "Create",
    status: "live",
    category: "create",
    group: "limited-editions",
  },
  {
    key: "mint-editions",
    cta: "Mint",
    blurb: "Release a new piece in as many copies as you choose.",
    title: "Mint Limited Edition",
    subtitle: "Add new editions to an existing collection",
    description:
      "Pick one of your Limited Edition contracts, upload artwork, set the supply, and release to collectors — all in a few clicks.",
    features: ["You choose how many copies", "Numbered automatically", "Ready to sell right away"],
    example: "Drop 25 numbered prints from your art series",
    icon: PlusCircle,
    gradient: "from-fuchsia-500/10 via-violet-400/4 to-transparent",
    borderColor: "border-fuchsia-500/20",
    iconColor: "text-fuchsia-500",
    buttonColor: "bg-fuchsia-600 hover:bg-fuchsia-700",
    badge: "Create",
    status: "live",
    category: "create",
    group: "limited-editions",
  },
  {
    key: "remix-asset",
    cta: "Browse",
    blurb: "Create from another work \u2014 credit and royalties are handled for you.",
    title: "Remix Asset",
    subtitle: "Derivative works with on-chain attribution",
    description:
      "Create a licensed derivative of any digital asset with full provenance and attribution flowing back to the original creator on-chain.",
    features: ["Credit handled automatically", "Royalties flow to the original", "License respected at mint"],
    example: "A remix of a song, an artwork inspired by an original",
    icon: GitBranch,
    gradient: "from-rose-500/10 via-pink-400/4 to-transparent",
    borderColor: "border-rose-500/20",
    iconColor: "text-rose-500",
    buttonColor: "bg-brand-rose hover:bg-brand-rose/90",
    badge: "Create",
    status: "live",
    category: "create",
    group: "licensing-remix",
  },

  // ── Launch ────────────────────────────────────────────────────────────────
  {
    key: "pop-protocol",
    cta: "Create",
    blurb: "Hand out badges your attendees keep forever.",
    title: "POP Protocol",
    subtitle: "Proof-of-participation for events & communities",
    description:
      "Issue soulbound credentials to your community — one non-transferable badge per wallet, permanently on-chain. No transferring, no faking.",
    features: ["Free for your community to claim", "Invite-list gating optional", "Branded event page to share"],
    example: "Hackathon attendance badge, community membership, conference pass",
    icon: Award,
    gradient: "from-emerald-500/10 via-green-400/4 to-transparent",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-500",
    buttonColor: "bg-green-600 hover:bg-green-700",
    badge: "Launch",
    browseLinkLabel: "Browse events",
    status: "live",
    category: "launch",
    group: "pop-protocol",
  },
  {
    key: "collection-drop",
    cta: "Launch",
    blurb: "Set a price, a window, and a limited run \u2014 then open the doors.",
    title: "Collection Drop",
    subtitle: "Timed NFT releases with mint windows",
    description:
      "Launch a time-gated mint campaign — set a price, supply cap, start and end time, and let collectors mint directly from your drop page.",
    features: ["You set price and supply", "Opens and closes on your schedule", "Branded drop page to share"],
    example: "A 48-hour drop of 200 pieces at 5 USDC each",
    icon: Package,
    gradient: "from-orange-500/10 via-amber-400/4 to-transparent",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    badge: "Launch",
    browseLinkLabel: "Browse drops",
    status: "live",
    category: "launch",
    group: "collection-drop",
  },
  {
    key: "ip-tickets",
    cta: "Sell",
    blurb: "Sell tickets to your shows and events.",
    title: "IP Tickets",
    subtitle: "Gate real-world experiences with NFTs",
    description:
      "Distribute tickets for concerts, workshops, and events. Each ticket is verifiable on-chain proof of attendance.",
    features: ["NFT-based event gating", "Proof of attendance", "Transferable or soulbound"],
    icon: Ticket,
    gradient: "from-teal-500/10 via-cyan-400/4 to-transparent",
    borderColor: "border-teal-500/20",
    iconColor: "text-teal-500",
    buttonColor: "bg-teal-600 hover:bg-teal-700",
    badge: "Launch",
    browseLinkLabel: "Browse tickets",
    // Flip to "live" only after Phase 3/4 mainnet deploy — see
    // medialane-core/docs/plans/2026-07-02-launchpad-tickets-club-sponsorship-plan.md
    status: "building",
    category: "launch",
    group: "ip-tickets",
  },
  {
    key: "ip-club",
    cta: "Create",
    blurb: "Passes that unlock more for your closest fans.",
    title: "IP Club",
    subtitle: "Membership passes with an on-chain card",
    description:
      "Create a membership club backed by an on-chain NFT membership card. Set an entry fee, a member cap, and open or close joining anytime.",
    features: ["On-chain membership card", "Optional entry fee", "Open or close joining anytime"],
    icon: Users,
    gradient: "from-indigo-500/10 via-violet-400/4 to-transparent",
    borderColor: "border-indigo-500/20",
    iconColor: "text-indigo-400",
    buttonColor: "bg-indigo-600 hover:bg-indigo-700",
    badge: "Launch",
    browseLinkLabel: "Browse clubs",
    status: "building",
    category: "launch",
    group: "ip-club",
  },

  // ── Monetize ─────────────────────────────────────────────────────────────
  {
    key: "subscriptions",
    cta: "Start",
    blurb: "Recurring support from your audience.",
    title: "Subscriptions",
    subtitle: "Recurring on-chain revenue",
    description:
      "Monthly licensing, creator support tiers, and access passes — all auto-renewed without intermediaries.",
    features: ["Recurring revenue", "Auto-renewal protocol", "No middlemen"],
    icon: RefreshCw,
    gradient: "from-sky-500/6 via-blue-400/2 to-transparent",
    borderColor: "border-sky-500/10",
    iconColor: "text-sky-400",
    badge: "Soon",
    status: "soon",
    category: "monetize",
    group: "coming-soon",
  },
  {
    key: "ip-coins",
    cta: "Launch",
    blurb: "Let fans own a piece of your catalog.",
    title: "IP Coins",
    subtitle: "Fractional ownership of intellectual property",
    description:
      "Tokenize your IP catalog as fungible tokens. Enable fractional ownership and liquid markets around your creative work.",
    features: ["Fungible IP tokens", "Fractional ownership", "Liquid secondary markets"],
    icon: Coins,
    gradient: "from-amber-500/6 via-yellow-400/2 to-transparent",
    borderColor: "border-amber-500/10",
    iconColor: "text-amber-400",
    badge: "Soon",
    status: "soon",
    category: "monetize",
    group: "coming-soon",
  },
  {
    key: "creator-coins",
    cta: "Launch",
    blurb: "Launch your coin in a few clicks \u2014 and stay in control of it.",
    title: "Creator Coin",
    subtitle: "Your own coin, your liquidity",
    description:
      "Launch a standard ERC-20 coin tied to your creative work, paired with a public Ekubo liquidity pool. You set the supply and allocation — and you stay in control of the liquidity.",
    features: ["Launch in a few clicks", "You keep control of the liquidity", "Traded on a public pool"],
    example: "A fan coin for your channel, a coin for your music project",
    icon: TrendingUp,
    gradient: "from-pink-500/6 via-rose-400/2 to-transparent",
    borderColor: "border-pink-500/20",
    iconColor: "text-pink-400",
    buttonColor: "bg-brand-rose hover:bg-brand-rose/90",
    badge: "Launch",
    status: "live",
    category: "monetize",
    group: "creator-coins",
  },

  // ── Claims ────────────────────────────────────────────────────────────────
  {
    key: "claim-memecoin",
    cta: "Claim",
    blurb: "Already launched a coin? Add it to your Medialane profile.",
    title: "Claim Memecoin",
    subtitle: "Bring your Starknet coin to Medialane",
    description:
      "Already launched a coin on Starknet (unrug or partner)? Claim it to add it to Medialane — reviewed by our team, then live on the Coins page and your profile.",
    features: ["Bring a coin you already launched", "Reviewed by our team", "Featured on the Coins page"],
    example: "Your unrug memecoin, listed on your creator profile",
    icon: Coins,
    gradient: "from-orange-500/10 via-amber-400/4 to-transparent",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    badge: "Claim",
    status: "live",
    category: "monetize",
    group: "creator-coins",
  },
  {
    key: "claim-username",
    cta: "Claim",
    blurb: "Reserve your name and get your own creator page.",
    title: "Claim Username",
    subtitle: "Reserve your creator page URL",
    description:
      "Claim your unique username and get a shareable creator page — your public portfolio at a clean, memorable URL. Free, and yours.",
    features: ["Free claim", "Shareable creator page", "Your public portfolio"],
    example: "medialane.io/your-name — your portfolio at your own name",
    icon: AtSign,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-brand-purple hover:bg-brand-purple/90",
    badge: "Claim",
    status: "live",
    category: "create",
    group: "claims",
  },
  {
    key: "claim-collection",
    cta: "Claim",
    blurb: "Made a collection somewhere else? Bring it to your profile.",
    title: "Claim Collection",
    subtitle: "Import an existing Starknet collection",
    description:
      "Already deployed an ERC-721 collection on Starknet? Claim it to link it to your Medialane profile and give it a branded collection page.",
    features: ["Bring an existing collection", "Linked to your profile", "Branded collection page"],
    example: "A collection you deployed elsewhere joins your profile",
    icon: FolderInput,
    gradient: "from-blue-500/10 via-sky-400/4 to-transparent",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    buttonColor: "bg-brand-blue hover:bg-brand-blue/90",
    badge: "Claim",
    status: "live",
    category: "create",
    group: "claims",
  },
  {
    key: "claim-collection-name",
    cta: "Claim",
    blurb: "Give your collection a clean, memorable web address of its own.",
    title: "Claim Collection Name",
    subtitle: "Reserve your collection page URL",
    description:
      "Claim a custom name for your collection page — a clean, shareable URL your fans can remember, instead of a long contract address.",
    features: ["Free claim", "Clean shareable URL", "Easy to remember and share"],
    example: "medialane.io/collections/your-collection",
    icon: Link2,
    gradient: "from-pink-500/10 via-rose-400/4 to-transparent",
    borderColor: "border-pink-500/20",
    iconColor: "text-pink-500",
    badge: "Claim",
    status: "live",
    category: "create",
    group: "claims",
  },
];
