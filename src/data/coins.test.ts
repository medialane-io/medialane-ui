import { describe, expect, it } from "bun:test";
import { coinSupply, fdvUsd, coinAccentToken, coinKindLabelPlural, type CoinCollectionLike, type CoinPriceLike } from "./coins.js";

const coin = (over: Partial<CoinCollectionLike> = {}): CoinCollectionLike => ({
  contractAddress: "0x1",
  symbol: "TEST",
  ...over,
});

describe("coinSupply", () => {
  it("converts raw base units to whole tokens", () => {
    expect(coinSupply(coin({ totalSupply: "1000000000000000000000000000", decimals: 18 }))).toBe(1_000_000_000);
    expect(coinSupply(coin({ totalSupply: "1000000", decimals: 6 }))).toBe(1);
  });

  it("defaults to 18 decimals", () => {
    expect(coinSupply(coin({ totalSupply: "1000000000000000000" }))).toBe(1);
  });

  it("returns null for missing, zero, or unparseable supply", () => {
    expect(coinSupply(coin({ totalSupply: null }))).toBeNull();
    expect(coinSupply(coin({ totalSupply: "" }))).toBeNull();
    expect(coinSupply(coin({ totalSupply: "0" }))).toBeNull();
    expect(coinSupply(coin({ totalSupply: "not-a-number" }))).toBeNull();
  });

  it("treats a dust supply as no supply rather than a misleading figure", () => {
    expect(coinSupply(coin({ totalSupply: "49", decimals: 18 }))).toBeNull();
  });
});

describe("fdvUsd", () => {
  const price: CoinPriceLike = { quotePerCoin: 0.001, quoteSymbol: "ETH", quoteUsdRate: 2000 };

  it("multiplies whole-token supply, not raw units", () => {
    const c = coin({ totalSupply: "1000000000000000000000000", decimals: 18 });
    expect(fdvUsd(price, c)).toBe(1_000_000 * 0.001 * 2000);
  });

  it("returns null without a USD rate or supply", () => {
    expect(fdvUsd({ ...price, quoteUsdRate: null }, coin({ totalSupply: "1000000000000000000" }))).toBeNull();
    expect(fdvUsd(price, coin({ totalSupply: null }))).toBeNull();
    expect(fdvUsd(null, coin({ totalSupply: "1000000000000000000" }))).toBeNull();
  });
});

describe("coinAccentToken", () => {
  it("returns a brand token class, never an ad-hoc color", () => {
    for (const seed of ["SLINK", "PAL", "SSTR", "SCHIZODIO", "SLAY", "BROTHER"]) {
      expect(coinAccentToken(seed)).toMatch(/^bg-brand-(rose|maeve|purple|orange|blue)$/);
    }
  });

  it("is stable for the same seed", () => {
    expect(coinAccentToken("SLINK")).toBe(coinAccentToken("SLINK"));
  });
});

describe("coinKindLabelPlural", () => {
  it("pluralises coin-suffixed labels for count displays", () => {
    expect(coinKindLabelPlural("memecoin")).toBe("Memecoins");
    expect(coinKindLabelPlural("creator")).toBe("Creator Coins");
  });

  it("leaves a label that is not a coin noun alone", () => {
    expect(coinKindLabelPlural("unruggable")).toBe("Unruggable");
  });
});
