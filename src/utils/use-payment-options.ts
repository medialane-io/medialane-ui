"use client";

import useSWR from "swr";
import { getListableTokens } from "@medialane/sdk";
import { erc20Balance } from "@medialane/sdk/starknet";
import { useMedialaneApp } from "../components/medialane-app.js";

export interface PaymentOption {
  symbol: string;
  decimals: number;
  balance: bigint;
  /** What paying with this coin costs, in this coin; null while it is quoted or when there is no route. */
  cost: bigint | null;
  covers: boolean;
}

export interface PaymentOptionsInput {
  /** The coin the order is priced in. */
  currency: string;
  /** What the purchase spends in `currency`, fee included. */
  amountRaw: bigint;
  walletAddress: string | null;
}

/**
 * The coins a wallet can pay with: the order's own coin first, then every other listable coin the
 * wallet holds, each priced through a swap quote.
 */
export function usePaymentOptions({ currency, amountRaw, walletAddress }: PaymentOptionsInput): {
  options: PaymentOption[];
  isLoading: boolean;
} {
  const { getClient, signedIn } = useMedialaneApp();
  const tokens = getListableTokens();

  const balances = useSWR(
    walletAddress ? ["payment-balances", walletAddress] : null,
    ([, holder]) => Promise.all(tokens.map((t) => erc20Balance(getClient().provider, t.address, holder))),
    { refreshInterval: 30_000, revalidateOnFocus: false, shouldRetryOnError: false, onError: () => {} },
  );

  const balanceOf = (symbol: string) => balances.data?.[tokens.findIndex((t) => t.symbol === symbol)] ?? 0n;
  const held = tokens.filter((t) => t.symbol !== currency && balanceOf(t.symbol) > 0n).map((t) => t.symbol);

  const quotes = useSWR(
    signedIn && walletAddress && held.length > 0 && amountRaw > 0n
      ? ["payment-quotes", currency, amountRaw.toString(), walletAddress, held.join(",")]
      : null,
    () =>
      Promise.all(
        held.map((symbol) =>
          getClient()
            .api.platform.swapQuote({
              sellSymbol: symbol,
              buySymbol: currency,
              buyAmountRaw: amountRaw.toString(),
              takerAddress: walletAddress!,
            })
            .then((quote) => BigInt(quote.sellAmount))
            .catch(() => null),
        ),
      ),
    { refreshInterval: 20_000, dedupingInterval: 15_000, revalidateOnFocus: false, shouldRetryOnError: false, keepPreviousData: true },
  );

  const own = tokens.find((t) => t.symbol === currency);
  const options: PaymentOption[] = [];
  if (own) {
    const balance = balanceOf(currency);
    options.push({ symbol: currency, decimals: own.decimals, balance, cost: amountRaw, covers: balance >= amountRaw });
  }
  held.forEach((symbol, i) => {
    const token = tokens.find((t) => t.symbol === symbol)!;
    const balance = balanceOf(symbol);
    const cost = quotes.data?.[i] ?? null;
    options.push({ symbol, decimals: token.decimals, balance, cost, covers: cost !== null && balance >= cost });
  });

  return { options, isLoading: balances.isLoading || (held.length > 0 && quotes.isLoading) };
}

/** The coin to pay with: `current` while it still covers the purchase, otherwise the first that does. */
export function pickPayment(options: readonly PaymentOption[], current: string | null): string | null {
  if (current && options.some((o) => o.symbol === current && o.covers)) return current;
  return options.find((o) => o.covers)?.symbol ?? null;
}
