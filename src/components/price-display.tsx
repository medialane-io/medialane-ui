"use client";

import type { ReactNode } from "react";
import { CurrencyIcon, hasCurrencyIcon } from "./currency-icon.js";
import { cn } from "../utils/cn.js";
import { formatCompactPrice, formatDisplayPrice, isStableCurrency } from "../utils/format.js";

const SCALES = {
  hero: {
    gap: "gap-x-4 gap-y-2",
    icon: 26,
    amount: "text-3xl",
    name: "text-lg",
    pill: "px-3 py-1 text-sm",
    showName: true,
    compact: false,
  },
  row: {
    gap: "gap-x-3 gap-y-1",
    icon: 14,
    amount: "text-sm",
    name: "text-xs",
    pill: "px-2 py-0.5 text-xs",
    showName: true,
    compact: false,
  },
  card: {
    gap: "gap-x-2.5",
    icon: 14,
    amount: "text-base",
    name: "text-xs",
    pill: "px-2 py-0.5 text-xs",
    showName: false,
    compact: true,
  },
} as const;

export type PriceScale = keyof typeof SCALES;

function usdLabel(usdValue: string, compact: boolean): string {
  let amount = usdValue.replace("$", "");
  if (compact) {
    const n = Number(amount.replace(/,/g, ""));
    if (isFinite(n) && n >= 1000) amount = formatCompactPrice(n);
  }
  return amount.startsWith("<") ? `${amount} USD` : `≈ ${amount} USD`;
}

export function PriceDisplay({
  amountFormatted,
  currency,
  usdValue,
  scale,
  trailing,
  className,
  pillClassName,
}: {
  amountFormatted: string | null | undefined;
  currency: string | null | undefined;
  usdValue?: string | null;
  scale: PriceScale;
  trailing?: ReactNode;
  className?: string;
  pillClassName?: string;
}) {
  if (!amountFormatted) return null;
  const s = SCALES[scale];
  const amount = s.compact ? formatCompactPrice(amountFormatted) : formatDisplayPrice(amountFormatted);
  const showName = !!currency && (s.showName || !hasCurrencyIcon(currency));
  const showPill = !!usdValue && !isStableCurrency(currency);

  return (
    <span
      className={cn(
        "inline-flex items-center tabular-nums",
        s.gap,
        scale === "hero" ? "flex-wrap" : "flex-nowrap whitespace-nowrap",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CurrencyIcon symbol={currency} size={s.icon} />
        <span className={cn("font-semibold tracking-tight text-foreground", s.amount)}>{amount}</span>
        {showName ? <span className={cn("font-semibold text-muted-foreground", s.name)}>{currency}</span> : null}
      </span>
      {showPill ? (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-foreground/[0.06] font-medium text-muted-foreground",
            s.pill,
            pillClassName
          )}
        >
          {usdLabel(usdValue!, s.compact)}
        </span>
      ) : null}
      {trailing}
    </span>
  );
}
