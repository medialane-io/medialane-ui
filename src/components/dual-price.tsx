"use client";

import type { ReactNode } from "react";
import { CurrencyIcon } from "./currency-icon.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";

/** Currency icon in the soft circular chip used throughout the wallet UI —
 *  reads as a coin, not a stray glyph floating next to text. */
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

const DISPLAY_FACE = "font-[family-name:var(--font-display)] font-extrabold tracking-tight tabular-nums";

const DUAL_PRICE_SCALES = {
  /** Full-width hero contexts: AssetMarketplacePanel's main price. Has room
   *  to spell out the currency ("0.07 ETH"), not just imply it via icon. */
  hero: { fiat: "text-4xl", crypto: "text-2xl", chip: 16, stableChip: 13, divider: "h-7", showCurrencyLabel: true },
  /** Card contexts: ListingCard's full variant — denser, the coin icon
   *  already conveys the currency, a text label would be redundant. */
  card: { fiat: "text-lg", crypto: "text-sm", chip: 11, stableChip: 9, divider: "h-4", showCurrencyLabel: false },
} as const;

/**
 * Equal-weight dual price: fiat and the on-chain currency shown as peers,
 * not primary/afterthought — this platform's audience spans non-crypto
 * newcomers who read fiat and crypto-native buyers who read the token
 * amount. Both use the brand display face at a real step-down in scale so
 * the pairing reads as "two related numbers," not one dominant + one
 * caption. Falls back to crypto-only when no USD rate is available. When
 * the currency is itself a USD-pegged stablecoin, the crypto amount
 * collapses to a small currency badge — showing "$12.00" beside "12.00
 * USDC" would just be the same number twice.
 */
export function DualPrice({
  amountFormatted,
  currency,
  usdValue,
  scale,
  trailing,
}: {
  amountFormatted: string | null | undefined;
  currency: string | null | undefined;
  usdValue?: string | null;
  scale: keyof typeof DUAL_PRICE_SCALES;
  trailing?: ReactNode;
}) {
  if (!amountFormatted) return null;
  const s = DUAL_PRICE_SCALES[scale];
  const cryptoDisplay = formatDisplayPrice(amountFormatted);

  if (!usdValue) {
    return (
      <div className={`flex items-center gap-2.5 ${DISPLAY_FACE} ${s.fiat}`}>
        <CoinChip symbol={currency} size={s.chip} />
        {cryptoDisplay}
        {trailing && <span className="ml-0.5">{trailing}</span>}
      </div>
    );
  }

  const stable = isStableCurrency(currency);
  return (
    <div className="flex items-center gap-2.5">
      <span className={`${DISPLAY_FACE} ${s.fiat}`}>{usdValue}</span>
      {!stable && <span className={`${s.divider} w-px bg-border/60 shrink-0`} />}
      <span className="inline-flex items-center gap-1.5">
        <CoinChip symbol={currency} size={stable ? s.stableChip : s.chip} />
        {stable ? (
          <span className="text-sm font-semibold text-muted-foreground">{currency}</span>
        ) : s.showCurrencyLabel ? (
          <span className="flex items-baseline gap-1.5">
            <span className={`${DISPLAY_FACE} ${s.crypto} text-foreground/90`}>{cryptoDisplay}</span>
            <span className="text-sm font-semibold text-muted-foreground/70">{currency}</span>
          </span>
        ) : (
          <span className={`${DISPLAY_FACE} ${s.crypto} text-foreground/90`}>{cryptoDisplay}</span>
        )}
      </span>
      {trailing && <span className="ml-0.5">{trailing}</span>}
    </div>
  );
}

const CHIP_TONES = {
  /** Full-bleed image overlays (AssetCard) — fixed dark glass, guaranteed
   *  readable regardless of the artwork or the viewer's theme. */
  "overlay-dark": { dot: "text-white/30", text: "text-white/65" },
  /** Theme-aware card backgrounds (TokenCard). */
  card: { dot: "text-muted-foreground/50", text: "text-muted-foreground" },
} as const;

/**
 * Overlay/pill price content — fiat leads, crypto trails dimmer, middot-
 * separated; stablecoins collapse to fiat + symbol alone. Renders only the
 * inner fragment: callers own their own pill container (background, blur,
 * border, padding), which intentionally differs between hosts (see
 * `tone`) rather than being forced into one visual treatment.
 */
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
      {usdValue}
      <span className={t.dot}>·</span>
      <span className={`inline-flex items-center gap-1 font-semibold ${t.text}`}>
        {currency && <CurrencyIcon symbol={currency} size={12} />}
        {stable ? currency : cryptoDisplay}
      </span>
    </>
  );
}
