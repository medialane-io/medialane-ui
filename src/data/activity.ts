import { ArrowRightLeft, Tag, ShoppingCart, HandCoins, X, Sparkles } from "lucide-react";
import type { ElementType } from "react";
import { msg } from "../i18n/translate.js";

export interface ActivityTypeConfig {
  label: string;
  variant: "default" | "secondary" | "outline";
  icon: ElementType;
  colorClass: string;
  bgClass: string;
}

export const ACTIVITY_TYPE_CONFIG: Record<string, ActivityTypeConfig> = {
  mint:      { label: msg("Mint"),      variant: "default",   icon: Sparkles,       colorClass: "text-brand-purple", bgClass: "bg-brand-purple/15 dark:bg-brand-purple/25" },
  transfer:  { label: msg("Transfer"),  variant: "secondary", icon: ArrowRightLeft, colorClass: "text-brand-blue",   bgClass: "bg-brand-blue/15 dark:bg-brand-blue/25" },
  listing:   { label: msg("Listed"),    variant: "default",   icon: Tag,            colorClass: "text-brand-orange", bgClass: "bg-brand-orange/15 dark:bg-brand-orange/25" },
  sale:      { label: msg("Sale"),      variant: "default",   icon: ShoppingCart,   colorClass: "text-brand-rose",   bgClass: "bg-brand-rose/15 dark:bg-brand-rose/25" },
  offer:     { label: msg("Offer"),     variant: "outline",   icon: HandCoins,      colorClass: "text-brand-maeve",  bgClass: "bg-brand-maeve/15 dark:bg-brand-maeve/25" },
  cancelled: { label: msg("Cancelled"), variant: "outline",   icon: X,              colorClass: "text-muted-foreground", bgClass: "bg-muted" },
};

export const TYPE_FILTERS = [
  { label: msg("All"),       value: "" },
  { label: msg("Mints"),     value: "mint" },
  { label: msg("Sales"),     value: "sale" },
  { label: msg("Listings"),  value: "listing" },
  { label: msg("Offers"),    value: "offer" },
  { label: msg("Transfers"), value: "transfer" },
  { label: msg("Cancelled"), value: "cancelled" },
];
