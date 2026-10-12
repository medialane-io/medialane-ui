import { formatAmount, getTokenByAddress } from "@medialane/sdk";
import { dropMintCost, type DropMintState, type DropOnchain } from "@medialane/sdk/starknet";
import { priceLabel } from "./sale.js";

export type DropPhase = "upcoming" | "live" | "sold-out" | "ended";

export function dropPhase(t: { startTime: number; endTime: number }, maxSupply: bigint, minted: bigint, now: number): DropPhase {
  if (maxSupply !== 0n && minted >= maxSupply) return "sold-out";
  if (t.startTime !== 0 && now < t.startTime) return "upcoming";
  if (t.endTime !== 0 && now > t.endTime) return "ended";
  return "live";
}

export interface ActionBoxView {
  phase: DropPhase;
  statusText: string;
  countdown: { label: string; target: number } | null;
  priceText: string;
  totalText: string | null;
  eligibility: string | null;
  button: { label: string; action: "mint" | "sign-in" | "none" };
  maxQuantity: bigint;
}

const when = (ts: number) => new Date(ts * 1000).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Everything the mint box shows, decided from chain state before any transaction. */
export function actionBoxView(input: {
  drop: DropOnchain;
  mint: DropMintState;
  quantity: bigint;
  /** Platform fee added to a mint, in basis points. */
  feeBps: number;
  now: number;
}): ActionBoxView {
  const { drop, mint, feeBps, now } = input;
  const phase = dropPhase(drop, drop.maxSupply, drop.totalMinted, now);
  const token = getTokenByAddress(drop.paymentToken);
  const listed = BigInt(drop.allowlistRoot) !== 0n;
  const quantity = input.quantity < 1n ? 1n : input.quantity > mint.maxQuantity ? mint.maxQuantity : input.quantity;

  const statusText =
    phase === "upcoming" ? `Upcoming · starts ${when(drop.startTime)}`
    : phase === "sold-out" ? "Sold out"
    : phase === "ended" ? "Ended"
    : drop.endTime === 0 ? "Live · no end date" : "Live";
  const countdown =
    phase === "upcoming" ? { label: "Starts in", target: drop.startTime }
    : phase === "live" && drop.endTime !== 0 ? { label: "Ends in", target: drop.endTime }
    : null;

  let totalText: string | null = null;
  if (mint.state === "ready" && drop.price > 0n && token) {
    const { total } = dropMintCost(drop.price, quantity, feeBps);
    totalText = `Total ${formatAmount(total.toString(), token.decimals)} ${token.symbol} (incl. platform fee)`;
  }

  const button: ActionBoxView["button"] = (() => {
    switch (mint.state) {
      case "ready": return { label: `Mint ${quantity}`, action: "mint" };
      case "no-wallet": return { label: "Sign in to mint", action: "sign-in" };
      case "upcoming": return { label: `Starts ${when(drop.startTime)}`, action: "none" };
      case "ended": return { label: "This drop has ended", action: "none" };
      case "sold-out": return { label: "Sold out", action: "none" };
      case "no-link": return { label: "Open your claim link to mint", action: "none" };
      case "not-on-list": return { label: "This wallet isn't on the list", action: "none" };
      case "limit-reached": return { label: `You've minted your limit (${drop.maxPerWallet})`, action: "none" };
      case "insufficient-balance": return { label: `Not enough ${token?.symbol ?? "balance"}`, action: "none" };
      case "loading": return { label: "Checking…", action: "none" };
    }
  })();

  const eligibility =
    !listed ? "Open to everyone"
    : mint.state === "ready" ? "You're on the list"
    : mint.state === "no-link" ? "This drop is for a list — open your claim link to mint"
    : "This drop is for a list";

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
