import { expect, test } from "bun:test";
import { localizeRouter } from "./localize-router.js";

function fakeRouter() {
  const calls: Array<[string, string, unknown?]> = [];
  return {
    calls,
    router: {
      push: (href: string, options?: unknown) => void calls.push(["push", href, options]),
      replace: (href: string, options?: unknown) => void calls.push(["replace", href, options]),
      prefetch: (href: string, options?: unknown) => void calls.push(["prefetch", href, options]),
      back: () => {},
    },
  };
}

test("push, replace and prefetch prefix under pt and keep their options", () => {
  const { router, calls } = fakeRouter();
  const local = localizeRouter(router, "pt");
  local.push("/marketplace");
  local.replace("/search?q=x", { scroll: false });
  local.prefetch("/portfolio");
  expect(calls).toEqual([
    ["push", "/pt/marketplace", undefined],
    ["replace", "/pt/search?q=x", { scroll: false }],
    ["prefetch", "/pt/portfolio", undefined],
  ]);
});

test("other router methods are kept", () => {
  const { router } = fakeRouter();
  expect(localizeRouter(router, "pt").back).toBe(router.back);
});

test("an absolute url is left alone under pt", () => {
  const { router, calls } = fakeRouter();
  localizeRouter(router, "pt").push("https://example.com/x");
  expect(calls).toEqual([["push", "https://example.com/x", undefined]]);
});

test("under the default language it is the very same router", () => {
  const { router } = fakeRouter();
  expect(localizeRouter(router, "en")).toBe(router);
});
