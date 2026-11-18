import { expect, test } from "bun:test";
import { stripLocale, withLocale } from "./with-locale.js";

test("the default language is never prefixed", () => {
  expect(withLocale("/marketplace", "en")).toBe("/marketplace");
  expect(withLocale("/", "en")).toBe("/");
});

test("another language prefixes a site path", () => {
  expect(withLocale("/marketplace", "pt")).toBe("/pt/marketplace");
  expect(withLocale("/asset/x?y=1#z", "pt")).toBe("/pt/asset/x?y=1#z");
});

test("the root, with or without a query or hash, becomes the language root", () => {
  expect(withLocale("/", "pt")).toBe("/pt");
  expect(withLocale("/?a=1", "pt")).toBe("/pt?a=1");
  expect(withLocale("/#top", "pt")).toBe("/pt#top");
});

test("absolute, mailto, hash, query, relative and already-prefixed hrefs are untouched", () => {
  for (const href of [
    "https://example.com/a",
    "mailto:a@b.co",
    "tel:+15551234",
    "//cdn.example.com/x",
    "#section",
    "?q=1",
    "relative/path",
    "/pt",
    "/pt/marketplace",
    "/pt?x=1",
    "/pt#x",
  ]) {
    expect(withLocale(href, "pt")).toBe(href);
  }
});

test("a path that only starts with the language letters is still prefixed", () => {
  expect(withLocale("/ptolemy", "pt")).toBe("/pt/ptolemy");
});

test("stripLocale removes the language prefix and nothing else", () => {
  expect(stripLocale("/pt/portfolio/assets", "pt")).toBe("/portfolio/assets");
  expect(stripLocale("/pt", "pt")).toBe("/");
  expect(stripLocale("/ptolemy", "pt")).toBe("/ptolemy");
  expect(stripLocale("/portfolio", "pt")).toBe("/portfolio");
  expect(stripLocale("/pt/portfolio", "en")).toBe("/pt/portfolio");
});
