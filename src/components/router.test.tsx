import { afterAll, expect, mock, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { createElement } from "react";

const real = await import("next/navigation");

const calls: Array<[string, string, unknown?]> = [];
const router = {
  push: (href: string, options?: unknown) => calls.push(["push", href, options]),
  replace: (href: string, options?: unknown) => calls.push(["replace", href, options]),
  prefetch: (href: string, options?: unknown) => calls.push(["prefetch", href, options]),
  back: () => {},
};
let path = "/portfolio/assets";
const params = new URLSearchParams("a=1");
mock.module("next/navigation", () => ({ useRouter: () => router, usePathname: () => path, useSearchParams: () => params }));
afterAll(() => mock.module("next/navigation", () => real));

const { useRouter, usePathname, useSearchParams } = await import("./router.js");
const { I18nProvider } = await import("../i18n/provider.js");

const inLocale = (locale: string) => ({
  wrapper: ({ children }: { children: React.ReactNode }) => createElement(I18nProvider, { locale, messages: {}, children }),
});

test("router.push, replace and prefetch prefix under pt", () => {
  calls.length = 0;
  const { result } = renderHook(() => useRouter(), inLocale("pt"));
  result.current.push("/marketplace");
  result.current.replace("/search?q=x", { scroll: false });
  result.current.prefetch("/portfolio");
  expect(calls).toEqual([
    ["push", "/pt/marketplace", undefined],
    ["replace", "/pt/search?q=x", { scroll: false }],
    ["prefetch", "/pt/portfolio", undefined],
  ]);
});

test("router leaves an absolute url alone under pt", () => {
  calls.length = 0;
  const { result } = renderHook(() => useRouter(), inLocale("pt"));
  result.current.push("https://example.com/x");
  expect(calls).toEqual([["push", "https://example.com/x", undefined]]);
});

test("usePathname strips the prefix so /pt/portfolio/assets equals /portfolio/assets", () => {
  path = "/pt/portfolio/assets";
  const { result } = renderHook(() => usePathname(), inLocale("pt"));
  expect(result.current).toBe("/portfolio/assets");
});

test("without a provider useRouter, usePathname and useSearchParams are next/navigation's own", () => {
  path = "/portfolio/assets";
  expect(renderHook(() => useRouter()).result.current as unknown).toBe(router);
  expect(renderHook(() => usePathname()).result.current).toBe("/portfolio/assets");
  expect(renderHook(() => useSearchParams()).result.current as unknown).toBe(params);
});

test("usePathname passes null through", () => {
  path = null as unknown as string;
  const { result } = renderHook(() => usePathname(), inLocale("pt"));
  expect(result.current).toBeNull();
});
