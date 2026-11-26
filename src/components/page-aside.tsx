"use client";

import {
  ArrowLeftRight, Award, CalendarDays, Coins, FileCheck, Handshake, KeyRound, Layers, LayoutGrid, Link2, Lock, Plus, Scale, Share2,
  ShieldCheck, Sparkles, Ticket, TrendingUp, UserCircle, Users, Wallet, AtSign,
} from "lucide-react";
import { ClaimRail, type ClaimRailProps } from "./claim-rail.js";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";

const LICENSE = { icon: Scale, title: msg("Your license, attached"), desc: msg("The terms you choose are saved with the work.") };
const AUTHORSHIP = { icon: FileCheck, title: msg("Proof of authorship"), desc: msg("A permanent, dated record links the work to your account.") };
const SHARE_PAGE = { icon: LayoutGrid, title: msg("A page to share"), desc: msg("Every work in the collection in one place.") };
const COLLECTION_STEPS = [msg("Add a cover, name and short code"), msg("Create the collection")];

const ASIDES = {
  asset: {
    included: [
      { icon: Sparkles, title: msg("One of a kind"), desc: msg("A single copy with one owner at a time.") },
      LICENSE,
      AUTHORSHIP,
    ],
    steps: [msg("Add your image, name and story"), msg("Choose a collection and license terms"), msg("Sell or send it from your account")],
  },
  mintEdition: {
    included: [
      { icon: Layers, title: msg("Copies to collect"), desc: msg("Each copy can be owned, sent or sold separately.") },
      LICENSE,
      AUTHORSHIP,
    ],
    steps: [msg("Add your image, name and story"), msg("Choose the number of copies and license terms"), msg("Mint, then sell or send your copies")],
  },
  collection: {
    included: [
      { icon: Layers, title: msg("A home for your work"), desc: msg("Your cover, name and description bring it together.") },
      SHARE_PAGE,
      { icon: ShieldCheck, title: msg("Yours to manage"), desc: msg("Only you can add works to it.") },
    ],
    steps: [...COLLECTION_STEPS, msg("Add works to it whenever you like")],
  },
  editions: {
    included: [
      { icon: Layers, title: msg("Copies for every work"), desc: msg("Choose how many copies each work has.") },
      SHARE_PAGE,
      { icon: ShieldCheck, title: msg("Yours to manage"), desc: msg("Only you can add works to it.") },
    ],
    steps: [...COLLECTION_STEPS, msg("Mint limited editions into it")],
  },
  club: {
    included: [
      { icon: Users, title: msg("Membership tiers"), desc: msg("Add new tiers whenever you like.") },
      { icon: ArrowLeftRight, title: msg("Cards members can trade"), desc: msg("Members can sell or send their cards.") },
      { icon: ShieldCheck, title: msg("Yours to manage"), desc: msg("Only you can add membership cards.") },
    ],
    steps: [msg("Create your club"), msg("Add membership tiers"), msg("Sell the cards on the marketplace")],
  },
  tickets: {
    included: [
      { icon: Ticket, title: msg("Ticket types"), desc: msg("Add one for each event or seating level.") },
      { icon: CalendarDays, title: msg("Dates you set"), desc: msg("Choose when each ticket is valid.") },
      { icon: Wallet, title: msg("Held by your audience"), desc: msg("Tickets stay in each holder's account.") },
    ],
    steps: [msg("Create your ticket collection"), msg("Add your ticket types"), msg("Sell or send the tickets")],
  },
  pop: {
    included: [
      { icon: Award, title: msg("Stays with its holder"), desc: msg("Each certificate is permanently tied to one account.") },
      { icon: Users, title: msg("One per participant"), desc: msg("Each participant on your list claims one.") },
      { icon: Share2, title: msg("Links to share"), desc: msg("Participants claim through their link.") },
    ],
    steps: [msg("Add your event details"), msg("Publish your participant list"), msg("Share the claim links")],
  },
  coin: {
    included: [
      { icon: ShieldCheck, title: msg("Fixed supply forever"), desc: msg("No more can ever be created.") },
      { icon: Wallet, title: msg("Purchased at market price"), desc: msg("Creator buy capped at 10%.") },
      { icon: KeyRound, title: msg("Ownership renounced"), desc: msg("Renounced automatically at launch.") },
      { icon: ArrowLeftRight, title: msg("You choose the pair"), desc: msg("Pick any supported coin.") },
      { icon: Lock, title: msg("Locked liquidity"), desc: msg("Locked forever, and fees stay collectible.") },
    ],
    steps: [msg("Add a name, symbol and image"), msg("Set the supply, price and your share"), msg("Launch and trade")],
  },
  sponsorship: {
    included: [
      { icon: Handshake, title: msg("Paid directly"), desc: msg("Funds go from the sponsor to the author.") },
      { icon: FileCheck, title: msg("A license in return"), desc: msg("The sponsor receives it on the agreed terms.") },
      { icon: Plus, title: msg("Start from either side"), desc: msg("Offer your own work or propose to sponsor one.") },
    ],
    steps: [msg("Choose the work and set the terms"), msg("The other side responds"), msg("License and payment settle together")],
  },
  claimCollection: {
    included: [
      { icon: LayoutGrid, title: msg("A page for your collection"), desc: msg("Edit its name and cover.") },
      { icon: UserCircle, title: msg("On your profile"), desc: msg("Shown with the rest of your work.") },
      { icon: ShieldCheck, title: msg("Stays where it is"), desc: msg("Assets remain in the collection contract.") },
    ],
    steps: [msg("Paste the contract address"), msg("Ownership check on Starknet"), msg("Live on your profile")],
  },
  claimCollectionName: {
    included: [
      { icon: Link2, title: msg("A short web address"), desc: msg("Like medialane.io/collection/your-name.") },
      { icon: LayoutGrid, title: msg("Opens your collection"), desc: msg("Visitors land on its page.") },
    ],
    steps: [msg("Pick a collection"), msg("Choose a name"), msg("Live after review")],
  },
  claimMemecoin: {
    included: [
      { icon: Coins, title: msg("Listed on the Coins page"), desc: msg("Where people find and trade coins.") },
      { icon: UserCircle, title: msg("On your profile"), desc: msg("Shown with the rest of your work.") },
      { icon: TrendingUp, title: msg("Linked to your account"), desc: msg("Claiming only links the coin to the account.") },
    ],
    steps: [msg("Paste the coin contract address"), msg("Ownership check on Starknet"), msg("Live once confirmed")],
  },
  claimUsername: {
    included: [
      { icon: AtSign, title: msg("Your own creator address"), desc: msg("Like medialane.io/creator/yourname.") },
      { icon: UserCircle, title: msg("One public profile"), desc: msg("All your work in one place.") },
    ],
    steps: [msg("Pick a username"), msg("Availability check"), msg("Yours after DAO review")],
  },
} satisfies Record<string, ClaimRailProps>;

export type PageAsideKind = keyof typeof ASIDES;

export const PAGE_ASIDE_KINDS = Object.keys(ASIDES) as PageAsideKind[];

export function PageAside({ kind }: { kind: PageAsideKind }) {
  const t = useT();
  const { included = [], steps }: ClaimRailProps = ASIDES[kind];
  return (
    <ClaimRail
      included={included.map((item) => ({ ...item, title: t(item.title), desc: t(item.desc) }))}
      steps={steps.map((step) => t(step))}
    />
  );
}
