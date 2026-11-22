import { formatAmount, getTokenByAddress } from "@medialane/sdk";
import { dropMintCost, type DropMintState, type DropOnchain } from "@medialane/sdk/starknet";
import { priceLabel } from "./sale.js";
import { msg, type Phrase } from "../../i18n/translate.js";
import { formatDateTime } from "../../i18n/format.js";
import { DEFAULT_LOCALE } from "../../i18n/locales.js";

export type DropPhase = "upcoming" | "live" | "sold-out" | "ended";

export function dropPhase(t: { startTime: number; endTime: number }, maxSupply: bigint, minted: bigint, now: number): DropPhase {
  if (maxSupply !== 0n && minted >= maxSupply) return "sold-out";
  if (t.startTime !== 0 && now < t.startTime) return "upcoming";
  if (t.endTime !== 0 && now > t.endTime) return "ended";
  return "live";
}

export interface ActionBoxView {
  phase: DropPhase;
  statusText: Phrase;
  countdown: { label: string; target: number } | null;
  priceText: string;
  totalText: Phrase | null;
  eligibility: Phrase;
  button: { label: Phrase; action: "mint" | "sign-in" | "none" };
  maxQuantity: bigint;
}

const when = (ts: number, locale: string = DEFAULT_LOCALE) => formatDateTime(ts * 1000, locale, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function actionBoxView(input: {
  drop: DropOnchain;
  mint: DropMintState;
  quantity: bigint;
  feeBps: number;
  now: number;
  locale?: string;
}): ActionBoxView {
  const { drop, mint, feeBps, now } = input;
  const date = (ts: number) => when(ts, input.locale);
  const phase = dropPhase(drop, drop.maxSupply, drop.totalMinted, now);
  const token = getTokenByAddress(drop.paymentToken);
  const listed = BigInt(drop.allowlistRoot) !== 0n;
  const quantity = input.quantity < 1n ? 1n : input.quantity > mint.maxQuantity ? mint.maxQuantity : input.quantity;

  const statusText: Phrase =
    phase === "upcoming" ? { text: msg("Starts {date}"), vars: { date: date(drop.startTime) } }
    : phase === "sold-out" ? { text: msg("Sold out") }
    : phase === "ended" ? { text: msg("Ended") }
    : drop.endTime === 0 ? { text: msg("No end date") }
    : { text: msg("Ends {date}"), vars: { date: date(drop.endTime) } };
  const countdown =
    phase === "upcoming" ? { label: msg("Starts in"), target: drop.startTime }
    : phase === "live" && drop.endTime !== 0 ? { label: msg("Ends in"), target: drop.endTime }
    : null;

  let totalText: Phrase | null = null;
  if (mint.state === "ready" && drop.price > 0n && token) {
    const { total } = dropMintCost(drop.price, quantity, feeBps);
    totalText = { text: msg("Total {amount} with the platform fee"), vars: { amount: `${formatAmount(total.toString(), token.decimals)} ${token.symbol}` } };
  }

  const label = (text: string, vars?: Phrase["vars"]): Phrase => (vars ? { text, vars } : { text });
  const button: ActionBoxView["button"] = (() => {
    switch (mint.state) {
      case "ready": return { label: label(msg("Mint {count}"), { count: quantity.toString() }), action: "mint" };
      case "no-wallet": return { label: label(msg("Sign in to mint")), action: "sign-in" };
      case "upcoming": return { label: label(msg("Starts {date}"), { date: date(drop.startTime) }), action: "none" };
      case "ended": return { label: label(msg("This drop has ended")), action: "none" };
      case "sold-out": return { label: label(msg("Sold out")), action: "none" };
      case "no-link": return { label: label(msg("Open the claim link to mint")), action: "none" };
      case "not-on-list": return { label: label(msg("This wallet isn't on the list")), action: "none" };
      case "limit-reached": return { label: label(msg("Limit reached: {count} per wallet"), { count: drop.maxPerWallet.toString() }), action: "none" };
      case "insufficient-balance": return { label: label(msg("Not enough {symbol}"), { symbol: token?.symbol ?? "balance" }), action: "none" };
      case "loading": return { label: label(msg("Checking…")), action: "none" };
    }
  })();

  const eligibility: Phrase =
    !listed ? { text: msg("Open to everyone") }
    : mint.state === "ready" ? { text: msg("On the list") }
    : mint.state === "no-link" ? { text: msg("List only. Open the claim link to mint.") }
    : { text: msg("List only") };

  return {
    phase,
    statusText,
    countdown,
    priceText: priceLabel(drop.price.toString(), drop.paymentToken),
    totalText,
    eligibility,
    button,
    maxQuantity: mint.maxQuantity,
  };
}
