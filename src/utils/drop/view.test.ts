import { describe, expect, test } from "bun:test";
import { getTokenBySymbol, normalizeAddress } from "@medialane/sdk";
import type { DropMintState, DropOnchain } from "@medialane/sdk/starknet";
import { actionBoxView, dropPhase } from "./view.js";

const NOW = 1_800_000_000;
const USDC = normalizeAddress("STARKNET", getTokenBySymbol("USDC")!.address);
const drop = (over: Partial<DropOnchain> = {}): DropOnchain => ({
  organizer: "0x1", startTime: 0, endTime: 0, price: 0n, paymentToken: normalizeAddress("STARKNET", "0x0"),
  maxPerWallet: 0n, allowlistRoot: "0x0", maxSupply: 500n, totalMinted: 310n, ...over,
});
const view = (state: DropMintState["state"], over: Partial<DropOnchain> = {}, maxQuantity = 0n, quantity = 1n) =>
  actionBoxView({ drop: drop(over), mint: { state, maxQuantity }, quantity, feeBps: 100, now: NOW });

describe("dropPhase", () => {
  test("upcoming, live at the edges, ended, sold out", () => {
    expect(dropPhase({ startTime: NOW + 1, endTime: 0 }, 10n, 0n, NOW)).toBe("upcoming");
    expect(dropPhase({ startTime: NOW, endTime: NOW }, 10n, 0n, NOW)).toBe("live");
    expect(dropPhase({ startTime: 0, endTime: NOW - 1 }, 10n, 0n, NOW)).toBe("ended");
    expect(dropPhase({ startTime: 0, endTime: 0 }, 10n, 10n, NOW)).toBe("sold-out");
    expect(dropPhase({ startTime: 0, endTime: 0 }, 0n, 10_000n, NOW)).toBe("live");
  });
});

describe("action box", () => {
  test("ready on a paid drop shows the total with the fee and a Mint button", () => {
    const v = view("ready", { price: 5_000_000n, paymentToken: USDC }, 5n, 2n);
    expect(v.button).toEqual({ label: { text: "Mint {count}", vars: { count: "2" } }, action: "mint" });
    expect(v.priceText).toBe("5 USDC");
    expect(v.totalText).toEqual({ text: "Total {amount} with the platform fee", vars: { amount: "10.1 USDC" } });
    expect(v.maxQuantity).toBe(5n);
    expect(v.eligibility).toEqual({ text: "Open to everyone" });
  });

  test("each blocked state has its own message", () => {
    expect(view("upcoming", { startTime: NOW + 60 }).button.label.text).toBe("Starts {date}");
    expect(view("upcoming", { startTime: NOW + 60 }).button.label.vars?.date).toBeTruthy();
    expect(view("upcoming", { startTime: NOW + 60 }).countdown).toEqual({ label: "Starts in", target: NOW + 60 });
    expect(view("ended").button).toEqual({ label: { text: "This drop has ended" }, action: "none" });
    expect(view("sold-out").button).toEqual({ label: { text: "Sold out" }, action: "none" });
    expect(view("no-wallet").button).toEqual({ label: { text: "Sign in to mint" }, action: "sign-in" });
    expect(view("no-link", { allowlistRoot: "0xabc" }).eligibility).toEqual({ text: "List only. Open the claim link to mint." });
    expect(view("no-link", { allowlistRoot: "0xabc" }).button).toEqual({ label: { text: "Open the claim link to mint" }, action: "none" });
    expect(view("not-on-list", { allowlistRoot: "0xabc" }).button).toEqual({ label: { text: "This wallet isn't on the list" }, action: "none" });
    expect(view("limit-reached", { maxPerWallet: 5n }).button).toEqual({ label: { text: "Limit reached: {count} per wallet", vars: { count: "5" } }, action: "none" });
    expect(view("insufficient-balance", { price: 1n, paymentToken: USDC }).button).toEqual({ label: { text: "Not enough {symbol}", vars: { symbol: "USDC" } }, action: "none" });
    expect(view("loading").button).toEqual({ label: { text: "Checking…" }, action: "none" });
  });

  test("a list drop that's ready says the wallet is on the list; a live drop with an end counts down", () => {
    expect(view("ready", { allowlistRoot: "0xabc" }, 1n).eligibility).toEqual({ text: "On the list" });
    expect(view("not-on-list", { allowlistRoot: "0xabc" }).eligibility).toEqual({ text: "List only" });
    expect(view("ready", { endTime: NOW + 600 }, 1n).countdown).toEqual({ label: "Ends in", target: NOW + 600 });
    expect(view("ready", { endTime: NOW + 600 }, 1n).statusText.text).toBe("Ends {date}");
    expect(view("ready", {}, 1n).statusText).toEqual({ text: "No end date" });
    expect(view("upcoming", { startTime: NOW + 60 }).statusText.text).toBe("Starts {date}");
    expect(view("sold-out", { totalMinted: 500n }).statusText).toEqual({ text: "Sold out" });
  });

  test("dates follow the visitor's language", () => {
    const en = actionBoxView({ drop: drop({ startTime: NOW + 60 }), mint: { state: "upcoming", maxQuantity: 0n }, quantity: 1n, feeBps: 0, now: NOW, locale: "en" });
    const pt = actionBoxView({ drop: drop({ startTime: NOW + 60 }), mint: { state: "upcoming", maxQuantity: 0n }, quantity: 1n, feeBps: 0, now: NOW, locale: "pt" });
    expect(en.statusText.vars?.date).not.toBe(pt.statusText.vars?.date);
  });

  test("the quantity never exceeds what the wallet can mint", () => {
    expect(view("ready", {}, 3n, 9n).button).toEqual({ label: { text: "Mint {count}", vars: { count: "3" } }, action: "mint" });
  });
});
