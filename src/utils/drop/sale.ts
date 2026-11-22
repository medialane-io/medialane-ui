import { formatAmount, getListableTokens, getTokenByAddress, parseAmount, type DropTermsBody } from "@medialane/sdk";
import { dropMintCost } from "@medialane/sdk/starknet";
import { isPositiveInteger } from "../launchpad-rules.js";
import { formatNumber } from "../../i18n/format.js";
import { msg, type Phrase } from "../../i18n/translate.js";

export interface SaleDraft {
  paid: boolean;
  price: string;
  tokenSymbol: string;
  startNow: boolean;
  start: string;
  hasEnd: boolean;
  end: string;
  limitPerWallet: boolean;
  perWallet: string;
}

export const EMPTY_SALE: SaleDraft = {
  paid: false, price: "", tokenSymbol: "USDC",
  startNow: true, start: "", hasEnd: false, end: "",
  limitPerWallet: false, perWallet: "",
};

export type SaleErrors = Partial<Record<"price" | "start" | "end" | "perWallet", Phrase>>;

export function saleToken(symbol: string) {
  return getListableTokens().find((t) => t.symbol === symbol) ?? null;
}

const toSeconds = (local: string): number | null => {
  if (!local) return null;
  const ms = new Date(local).getTime();
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
};

export function validateSale(d: SaleDraft, now: number): SaleErrors {
  const errors: SaleErrors = {};
  if (d.paid) {
    const token = saleToken(d.tokenSymbol);
    const decimals = d.price.split(".")[1]?.length ?? 0;
    if (!token) errors.price = { text: msg("Choose a currency") };
    else if (!/^\d+(\.\d+)?$/.test(d.price)) errors.price = { text: msg("Enter a price above 0") };
    else if (decimals > token.decimals) errors.price = { text: msg("Use at most {decimals} decimals for {symbol}"), vars: { decimals: token.decimals, symbol: token.symbol } };
    else if (BigInt(parseAmount(d.price, token.decimals)) === 0n) errors.price = { text: msg("Enter a price above 0") };
  }
  const start = d.startNow ? now : toSeconds(d.start);
  if (!d.startNow && (start === null || start <= now)) errors.start = { text: msg("Pick a start time in the future") };
  if (d.hasEnd) {
    const end = toSeconds(d.end);
    if (end === null || (start !== null && end <= start)) errors.end = { text: msg("The sale must end after it starts") };
  }
  if (d.limitPerWallet && !isPositiveInteger(d.perWallet)) errors.perWallet = { text: msg("Enter 1 or more") };
  return errors;
}

export function toDropTerms(d: SaleDraft): DropTermsBody {
  const token = d.paid ? saleToken(d.tokenSymbol) : null;
  return {
    startTime: d.startNow ? 0 : toSeconds(d.start)!,
    endTime: d.hasEnd ? toSeconds(d.end)! : 0,
    price: token ? parseAmount(d.price, token.decimals) : "0",
    paymentToken: token ? token.address : "0x0",
    maxPerWallet: d.limitPerWallet ? d.perWallet : "0",
  };
}

export function collectorPriceLine(d: SaleDraft, feeBps: number): Phrase | null {
  const token = d.paid ? saleToken(d.tokenSymbol) : null;
  if (!token || validateSale({ ...EMPTY_SALE, paid: true, price: d.price, tokenSymbol: d.tokenSymbol }, 0).price) return null;
  const price = BigInt(parseAmount(d.price, token.decimals));
  const { fee, total } = dropMintCost(price, 1, feeBps);
  const amount = (v: bigint) => `${formatAmount(v.toString(), token.decimals)} ${token.symbol}`;
  if (fee === 0n) return { text: msg("Collectors pay {price}."), vars: { price: amount(price) } };
  return { text: msg("Collectors pay {total} with a {fee}% platform fee. The creator gets {price}."), vars: { total: amount(total), fee: feeBps / 100, price: amount(price) } };
}

export function priceLabel(price: string, paymentToken: string): string {
  if (BigInt(price) === 0n) return "Free";
  const token = getTokenByAddress(paymentToken);
  return token ? `${formatAmount(price, token.decimals)} ${token.symbol}` : "Paid";
}

const count = (v: string) => formatNumber(Number(v));

export function supplyLabel(minted: string, maxSupply: string): string {
  return maxSupply === "0" ? `${count(minted)} minted` : `${count(minted)} / ${count(maxSupply)} minted`;
}
