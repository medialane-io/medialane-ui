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

/** Same circular chip as CoinChip, for fiat. Sized 1:1 with the crypto
 *  icon (fontSize === size, not a fraction of it) so the "$" reads with
 *  the same visual weight as the coin icon sitting next to it — a smaller,
 *  thinner glyph in an identically-sized circle looked like an afterthought
 *  next to a solid icon, even though the circles measured the same. */
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

/** usdValue arrives pre-formatted ("$13.14", "<$0.01") — the chip already
 *  carries the "$", so strip it from the number to avoid showing it twice. */
function stripDollarSign(usdValue: string): string {
  return usdValue.replace("$", "");
}

// Inter (the platform's default body font, applied via <body>'s className
// in every app's layout.tsx) rather than the Urbanist display face —
// direct feedback that the price numbers should use the standard system
// font, not the brand's opt-in heading face.
const DISPLAY_FACE = "font-extrabold tracking-tight tabular-nums";

const DUAL_PRICE_SCALES = {
  /** Full-width hero contexts: AssetMarketplacePanel's main price. */
  hero: { amount: "text-3xl", chip: 18, stableChip: 14, divider: "h-7", showLabel: true },
  /** Card contexts: ListingCard's full variant — denser, the coin icon
   *  already conveys the currency, a text label would be redundant. */
  card: { amount: "text-base", chip: 13, stableChip: 10, divider: "h-4", showLabel: false },
} as const;

/**
 * One currency's [chip] [amount] [optional code label] unit. Fiat and
 * crypto both render through this exact function — the previous version
 * had two separately-hand-coded branches (one baseline-aligned, one
 * center-aligned; one full-opacity, one dimmed) that drifted out of sync
 * with each other. Routing both through one function makes that class of
 * bug structurally impossible: there is only one place font, size,
 * opacity, and alignment for a price unit can be defined.
 */
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

/**
 * Equal-weight dual price: fiat and the on-chain currency shown as true
 * peers — same font, same size, same icon treatment, same label
 * alignment — not one dominant number with a secondary afterthought.
 * This platform's audience spans non-crypto newcomers who read fiat and
 * crypto-native buyers who read the token amount; neither should look
 * like the "real" price and the other a footnote. Falls back to
 * crypto-only when no USD rate is available. When the currency is itself
 * a USD-pegged stablecoin, the crypto side collapses to a chip + code
 * badge — showing "13.14 USD" beside "13.14 USDC" would just be the same
 * number twice.
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
 * Overlay/pill price content — fiat leads, crypto trails, middot-
 * separated; stablecoins collapse to fiat + symbol alone. Renders only the
 * inner fragment: callers own their own pill container (background, blur,
 * border, padding), which intentionally differs between hosts (see
 * `tone`) rather than being forced into one visual treatment. Smaller
 * scale than DualPrice (compact artwork overlay), so no fiat/crypto icon
 * chips here — the middot + dimmer trailing color is what marks the
 * crypto side as secondary in this tighter context.
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
