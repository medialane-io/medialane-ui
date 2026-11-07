import { ArrowRightLeft, Tag, ShoppingCart, HandCoins, X, Sparkles } from "lucide-react";
import type { ElementType } from "react";

export interface ActivityTypeConfig {
  label: string;
  variant: "default" | "secondary" | "outline";
  icon: ElementType;
  colorClass: string;
  bgClass: string;
}

export const ACTIVITY_TYPE_CONFIG: Record<string, ActivityTypeConfig> = {
  mint:      { label: "Mint",      variant: "default",   icon: Sparkles,       colorClass: "text-brand-purple", bgClass: "bg-brand-purple/15 dark:bg-brand-purple/25" },
  transfer:  { label: "Transfer",  variant: "secondary", icon: ArrowRightLeft, colorClass: "text-brand-blue",   bgClass: "bg-brand-blue/15 dark:bg-brand-blue/25" },
  listing:   { label: "Listed",    variant: "default",   icon: Tag,            colorClass: "text-brand-orange", bgClass: "bg-brand-orange/15 dark:bg-brand-orange/25" },
  sale:      { label: "Sale",      variant: "default",   icon: ShoppingCart,   colorClass: "text-brand-rose",   bgClass: "bg-brand-rose/15 dark:bg-brand-rose/25" },
  offer:     { label: "Offer",     variant: "outline",   icon: HandCoins,      colorClass: "text-brand-maeve",  bgClass: "bg-brand-maeve/15 dark:bg-brand-maeve/25" },
  cancelled: { label: "Cancelled", variant: "outline",   icon: X,              colorClass: "text-muted-foreground", bgClass: "bg-muted" },
};

export const TYPE_FILTERS = [
  { label: "All",       value: "" },
  { label: "Mints",     value: "mint" },
  { label: "Sales",     value: "sale" },
  { label: "Listings",  value: "listing" },
  { label: "Offers",    value: "offer" },
  { label: "Transfers", value: "transfer" },
  { label: "Cancelled", value: "cancelled" },
];
