import { expect, mock, test } from "bun:test";

mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

test("the package exports what the apps wire in: the archive dialog and the portfolio assets grid", async () => {
  const index = await import("./index.js");
  expect(typeof index.ArchiveAssetDialog).toBe("function");
  expect(typeof index.PortfolioAssets).toBe("function");
});
