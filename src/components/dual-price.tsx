"use client";

import type { ReactNode } from "react";
import { CurrencyIcon } from "./currency-icon.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";

export function CoinChip({ symbol, size }: { symbol: string | null | undefined; size: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-foreground/[0.06]"
      style={{ width: size + 10, height: size + 10 }}
    >
      <CurrencyIcon symbol={symbol ?? ""} size={size} />
    </span>
  );
}

function FiatChip({ size }: { size: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-foreground/[0.06] font-extrabold leading-none text-foreground/80"
      style={{ width: size + 10, height: size + 10, fontSize: size }}
    >
      $
    </span>
  );
}

function stripDollarSign(usdValue: string): string {
  return usdValue.replace("$", "");
}

const DISPLAY_FACE = "font-extrabold tracking-tight tabular-nums";

const DUAL_PRICE_SCALES = {

  hero: { amount: "text-3xl", chip: 18, stableChip: 14, divider: "h-7", showLabel: true },

  card: { amount: "text-base", chip: 13, stableChip: 10, divider: "h-4", showLabel: false },
} as const;

function PriceUnit({
  chip,
  amount,
  label,
  amountClassName,
}: {
  chip: ReactNode;
  amount: string;
  label?: string;
  amountClassName: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {chip}
      <span className="flex items-baseline gap-1.5">
        <span className={amountClassName}>{amount}</span>
        {label && <span className="text-sm font-semibold text-muted-foreground/70">{label}</span>}
      </span>
    </span>
  );
}

export function DualPrice({
  amountFormatted,
  currency,
  usdValue,
  scale,
  trailing,
  secondaryClassName,
}: {
  amountFormatted: string | null | undefined;
  currency: string | null | undefined;
  usdValue?: string | null;
  scale: keyof typeof DUAL_PRICE_SCALES;
  trailing?: ReactNode;
  secondaryClassName?: string;
}) {
  if (!amountFormatted) return null;
  const s = DUAL_PRICE_SCALES[scale];
  const cryptoDisplay = formatDisplayPrice(amountFormatted);
  const amountClass = `${DISPLAY_FACE} ${s.amount}`;

  if (!usdValue) {
    return (
      <div className="flex items-center gap-2.5">
        <PriceUnit
          chip={<CoinChip symbol={currency} size={s.chip} />}
          amount={cryptoDisplay}
          label={s.showLabel ? (currency ?? undefined) : undefined}
          amountClassName={amountClass}
        />
        {trailing && <span className="ml-0.5">{trailing}</span>}
      </div>
    );
  }

  const stable = isStableCurrency(currency);
  return (
    <div className="flex items-center gap-2.5">
      <PriceUnit
        chip={<FiatChip size={s.chip} />}
        amount={stripDollarSign(usdValue)}
        label={s.showLabel ? "USD" : undefined}
        amountClassName={amountClass}
      />
      <span className={`items-center gap-2.5 ${secondaryClassName ?? "flex"}`}>
        {!stable && <span className={`${s.divider} w-px bg-border/60 shrink-0`} />}
        {stable ? (
          <span className="inline-flex items-center gap-1.5">
            <CoinChip symbol={currency} size={s.stableChip} />
            <span className="text-sm font-semibold text-muted-foreground">{currency}</span>
          </span>
        ) : (
          <PriceUnit
            chip={<CoinChip symbol={currency} size={s.chip} />}
            amount={cryptoDisplay}
            label={s.showLabel ? (currency ?? undefined) : undefined}
            amountClassName={amountClass}
          />
        )}
      </span>
      {trailing && <span className="ml-0.5">{trailing}</span>}
    </div>
  );
}

const CHIP_TONES = {

  "overlay-dark": { dot: "text-white/30", text: "text-white/65" },

  card: { dot: "text-muted-foreground/50", text: "text-muted-foreground" },

  /** Same solid color as the primary USD figure — for cards that want a
   *  single consistent shade instead of a muted secondary currency. */
  solid: { dot: "text-foreground/40", text: "text-foreground" },
} as const;

export function PriceChipContent({
  amountFormatted,
  currency,
  usdValue,
  tone,
}: {
  amountFormatted: string | null | undefined;
  currency: string | null | undefined;
  usdValue?: string | null;
  tone: keyof typeof CHIP_TONES;
}) {
  if (!amountFormatted) return null;
  const cryptoDisplay = formatDisplayPrice(amountFormatted);
  const stable = isStableCurrency(currency);

  if (!usdValue) {
    return (
      <>
        {currency && <CurrencyIcon symbol={currency} size={13} />}
        {cryptoDisplay}
      </>
    );
  }

  const t = CHIP_TONES[tone];
  return (
    <>
      {stripDollarSign(usdValue)}
      <span className={`font-semibold ${t.text}`}>USD</span>
      <span className={t.dot}>·</span>
      <span className={`inline-flex items-center gap-1 font-semibold ${t.text}`}>
        {currency && <CurrencyIcon symbol={currency} size={12} />}
        {stable ? currency : cryptoDisplay}
      </span>
    </>
  );
}
