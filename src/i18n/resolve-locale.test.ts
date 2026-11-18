import { expect, test } from "bun:test";
import { resolveLocale } from "./resolve-locale.js";
import type { LocaleInfo } from "./locales.js";

const locales: LocaleInfo[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "pt", name: "Português", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
];
const resolve = (input: Parameters<typeof resolveLocale>[0]) => resolveLocale(input, locales);

test("the prefix beats the cookie and the header", () => {
  expect(resolve({ pathname: "/pt/asset", cookie: "es", acceptLanguage: "es" })).toEqual({ locale: "pt", pathname: "/asset" });
});

test("the cookie beats the header", () => {
  expect(resolve({ pathname: "/asset", cookie: "es", acceptLanguage: "pt" })).toEqual({ locale: "es", pathname: "/asset", redirectTo: "/es/asset" });
});

test("pt-BR in Accept-Language matches pt", () => {
  expect(resolve({ pathname: "/", acceptLanguage: "pt-BR,pt;q=0.9,en;q=0.8" })).toEqual({ locale: "pt", pathname: "/", redirectTo: "/pt" });
});

test("quality values are honoured", () => {
  expect(resolve({ pathname: "/a", acceptLanguage: "en;q=0.3, pt;q=0.9" }).locale).toBe("pt");
  expect(resolve({ pathname: "/a", acceptLanguage: "pt;q=0, en" })).toEqual({ locale: "en", pathname: "/a" });
});

test("no header and no cookie gives en without a redirect", () => {
  expect(resolve({ pathname: "/asset" })).toEqual({ locale: "en", pathname: "/asset" });
  expect(resolve({ pathname: "/asset", cookie: null, acceptLanguage: null })).toEqual({ locale: "en", pathname: "/asset" });
});

test("a language we do not have in the header is ignored", () => {
  expect(resolve({ pathname: "/asset", acceptLanguage: "fr-FR,de;q=0.8" })).toEqual({ locale: "en", pathname: "/asset" });
});

test("an unknown prefix /xx/asset is treated as a path under en, not a locale", () => {
  expect(resolve({ pathname: "/xx/asset" })).toEqual({ locale: "en", pathname: "/xx/asset" });
});

test("/PT/asset and /pt alone resolve", () => {
  expect(resolve({ pathname: "/PT/asset" })).toEqual({ locale: "pt", pathname: "/asset" });
  expect(resolve({ pathname: "/pt" })).toEqual({ locale: "pt", pathname: "/" });
});

test("cookie en with header pt stays en and never redirects", () => {
  expect(resolve({ pathname: "/asset", cookie: "en", acceptLanguage: "pt" })).toEqual({ locale: "en", pathname: "/asset" });
});

test("an invalid cookie is ignored", () => {
  expect(resolve({ pathname: "/asset", cookie: "zz", acceptLanguage: "pt" }).locale).toBe("pt");
});

test("a path with the en prefix redirects to the unprefixed path", () => {
  expect(resolve({ pathname: "/en/asset" })).toEqual({ locale: "en", pathname: "/asset", redirectTo: "/asset" });
  expect(resolve({ pathname: "/en" })).toEqual({ locale: "en", pathname: "/", redirectTo: "/" });
});

test("a path with the pt prefix never redirects, even for //evil.com", () => {
  expect(resolve({ pathname: "/pt//evil.com", acceptLanguage: "pt" }).redirectTo).toBeUndefined();
});

test("a redirect never leaves the site", () => {
  expect(resolve({ pathname: "/en//evil.com" }).redirectTo).toBe("/evil.com");
  expect(resolve({ pathname: "//evil.com", cookie: "pt" }).redirectTo).toBe("/pt/evil.com");
  expect(resolve({ pathname: "/en///evil.com" }).redirectTo).toBe("/evil.com");
});
