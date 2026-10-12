import { formatAmount, getListableTokens, getTokenByAddress, parseAmount, type DropTermsBody } from "@medialane/sdk";
import { dropMintCost } from "@medialane/sdk/starknet";

export interface SaleDraft {
  paid: boolean;
  /** In the token's normal units, e.g. "5.5". */
  price: string;
  tokenSymbol: string;
  startNow: boolean;
  /** `datetime-local` value in the creator's time zone. */
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

export type SaleErrors = Partial<Record<"price" | "start" | "end" | "perWallet", string>>;

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
    if (!token) errors.price = "Choose a currency";
    else if (!/^\d+(\.\d+)?$/.test(d.price)) errors.price = "Enter a price above 0";
    else if (decimals > token.decimals) errors.price = `Use at most ${token.decimals} decimals for ${token.symbol}`;
    else if (BigInt(parseAmount(d.price, token.decimals)) === 0n) errors.price = "Enter a price above 0";
  }
  const start = d.startNow ? now : toSeconds(d.start);
  if (!d.startNow && (start === null || start <= now)) errors.start = "Pick a start time in the future";
  if (d.hasEnd) {
    const end = toSeconds(d.end);
    if (end === null || (start !== null && end <= start)) errors.end = "The sale must end after it starts";
  }
  if (d.limitPerWallet && !/^[1-9]\d*$/.test(d.perWallet)) errors.perWallet = "Enter 1 or more";
  return errors;
}

/** Terms for the create intent; call only after `validateSale` returns no errors. */
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

/** What one token costs a collector, with the platform fee; null while the price is free or unfinished. */
export function collectorPriceLine(d: SaleDraft, feeBps: number): string | null {
  const token = d.paid ? saleToken(d.tokenSymbol) : null;
  if (!token || validateSale({ ...EMPTY_SALE, paid: true, price: d.price, tokenSymbol: d.tokenSymbol }, 0).price) return null;
  const price = BigInt(parseAmount(d.price, token.decimals));
  const { fee, total } = dropMintCost(price, 1, feeBps);
  const amount = (v: bigint) => `${formatAmount(v.toString(), token.decimals)} ${token.symbol}`;
  if (fee === 0n) return `Collectors pay ${amount(price)}.`;
  return `Collectors pay ${amount(total)} (incl. ${feeBps / 100}% platform fee). You receive ${amount(price)}.`;
}

export function priceLabel(price: string, paymentToken: string): string {
  if (BigInt(price) === 0n) return "Free";
  const token = getTokenByAddress(paymentToken);
  return token ? `${formatAmount(price, token.decimals)} ${token.symbol}` : "Paid";
}

const count = (v: string) => Number(v).toLocaleString("en-US");

export function supplyLabel(minted: string, maxSupply: string): string {
  return maxSupply === "0" ? `${count(minted)} minted` : `${count(minted)} / ${count(maxSupply)} minted`;
}
