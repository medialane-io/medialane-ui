import { expect, test } from "bun:test";
import { chooseLanguage } from "./language-choice.js";

test("choosing pt gives the cookie and the prefixed path", () => {
  const choice = chooseLanguage({ code: "pt", pathname: "/marketplace", locale: "en" });
  expect(choice.cookie).toBe("ml_locale=pt; Path=/; Max-Age=31536000; SameSite=Lax");
  expect(choice.href).toBe("/pt/marketplace");
});

test("choosing en from a prefixed page gives the unprefixed path and still a cookie", () => {
  const choice = chooseLanguage({ code: "en", pathname: "/pt/marketplace", locale: "pt" });
  expect(choice.cookie).toContain("ml_locale=en");
  expect(choice.href).toBe("/marketplace");
});

test("switching between two languages replaces the prefix", () => {
  expect(chooseLanguage({ code: "es", pathname: "/pt/asset/x", locale: "pt" }).href).toBe("/es/asset/x");
});

test("the query string and hash are kept", () => {
  expect(chooseLanguage({ code: "pt", pathname: "/search", locale: "en", search: "?q=a", hash: "#top" }).href).toBe("/pt/search?q=a#top");
});

test("the root becomes the language root, and back", () => {
  expect(chooseLanguage({ code: "pt", pathname: "/", locale: "en" }).href).toBe("/pt");
  expect(chooseLanguage({ code: "en", pathname: "/pt", locale: "pt" }).href).toBe("/");
});
