import { describe, expect, it } from "bun:test";
import { isPositiveInteger, isSymbol, isWebLink, positiveIntegerField, symbolField, webLinkField } from "./launchpad-rules";

describe("launchpad rules", () => {
  it("accepts 1 to 10 capital letters or digits as a symbol", () => {
    expect(isSymbol("SKHACK")).toBe(true);
    expect(isSymbol("A1")).toBe(true);
    expect(isSymbol("ABCDEFGHIJK")).toBe(false);
    expect(isSymbol("a-b")).toBe(false);
    expect(isSymbol("")).toBe(false);
  });

  it("accepts whole numbers of 1 or more, with or without padding spaces", () => {
    expect(isPositiveInteger("1")).toBe(true);
    expect(isPositiveInteger(" 250 ")).toBe(true);
    expect(isPositiveInteger("0")).toBe(false);
    expect(isPositiveInteger("007")).toBe(false);
    expect(isPositiveInteger("1.5")).toBe(false);
    expect(isPositiveInteger("-2")).toBe(false);
  });

  it("accepts an empty link or one starting with http or https", () => {
    expect(isWebLink("")).toBe(true);
    expect(isWebLink(undefined)).toBe(true);
    expect(isWebLink("https://a.io")).toBe(true);
    expect(isWebLink("http://a.io")).toBe(true);
    expect(isWebLink("ftp://a.io")).toBe(false);
    expect(isWebLink("a.io")).toBe(false);
  });

  it("builds zod fields from the same rules", () => {
    expect(symbolField().safeParse("OK1").success).toBe(true);
    expect(symbolField().safeParse("nope").success).toBe(false);
    expect(symbolField().safeParse("").success).toBe(false);
    expect(webLinkField().safeParse("ftp://a.io").success).toBe(false);
    expect(webLinkField().safeParse(undefined).success).toBe(true);
    expect(positiveIntegerField("Supply required").safeParse("5").success).toBe(true);
    expect(positiveIntegerField("Supply required").safeParse("0").success).toBe(false);
    expect(positiveIntegerField("Supply required").safeParse("").success).toBe(false);
  });
});
