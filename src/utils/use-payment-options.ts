"use client";

import type { ApiOrder } from "@medialane/sdk";
import type { PurchaseCost } from "@medialane/sdk/starknet";
import { useMedialaneClient } from "./use-medialane-client.js";
import { useSwapQuote } from "./use-swap-quote.js";
import { useTokenBalance } from "./media-wallet/use-erc20-balance.js";

export interface PaymentOption {
  symbol: string;
  decimals: number;
  balance: bigint;
  /** What paying with this coin costs, in this coin; null while it is quoted or when there is no route. */
  cost: bigint | null;
  covers: boolean;
}

/** The coins a purchase can be paid with, in the order they are offered. */
export const PAYMENT_COINS = ["USDC", "USDT", "ETH", "STRK", "WBTC"] as const;

function useCoin(symbol: string, currency: string, amountRaw: bigint, walletAddress: string | null) {
  const { rawBalance, isLoading, decimals } = useTokenBalance(symbol, walletAddress);
  const balance = rawBalance ?? 0n;
  const own = symbol === currency;
  const swappable = !own && balance > 0n && amountRaw > 0n;
  const { quote, isLoading: quoting } = useSwapQuote(swappable ? symbol : null, currency, swappable ? amountRaw.toString() : null, walletAddress);
  const cost = own ? amountRaw : quote ? BigInt(quote.sellAmount) : null;
  const option: PaymentOption | null =
    own || balance > 0n ? { symbol, decimals, balance, cost, covers: cost !== null && balance >= cost } : null;
  return { option, isLoading: isLoading || (swappable && quoting) };
}

/**
 * What buying `quantity` from `order` costs, and the coins the wallet can pay with: the order's own
 * coin first, then every other coin it holds, each priced through a swap quote.
 */
export function usePaymentOptions({ order, quantity, walletAddress }: { order: ApiOrder; quantity: number; walletAddress: string | null }): {
  cost: PurchaseCost;
  options: PaymentOption[];
  isLoading: boolean;
} {
  const cost = useMedialaneClient().purchaseCost(order, quantity);
  const currency = order.price?.currency ?? "";
  const coins = [
    useCoin(PAYMENT_COINS[0], currency, cost.total, walletAddress),
    useCoin(PAYMENT_COINS[1], currency, cost.total, walletAddress),
    useCoin(PAYMENT_COINS[2], currency, cost.total, walletAddress),
    useCoin(PAYMENT_COINS[3], currency, cost.total, walletAddress),
    useCoin(PAYMENT_COINS[4], currency, cost.total, walletAddress),
  ];
  const listed = coins.map((c) => c.option).filter((o): o is PaymentOption => o !== null);
  const options = [...listed.filter((o) => o.symbol === currency), ...listed.filter((o) => o.symbol !== currency)];
  return { cost, options, isLoading: coins.some((c) => c.isLoading) };
}

/** The coin to pay with: `current` while it still covers the purchase, otherwise the first that does. */
export function pickPayment(options: readonly PaymentOption[], current: string | null): string | null {
  if (current && options.some((o) => o.symbol === current && o.covers)) return current;
  return options.find((o) => o.covers)?.symbol ?? null;
}
