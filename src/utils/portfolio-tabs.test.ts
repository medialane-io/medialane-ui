import { expect, test } from "bun:test";
import { visiblePortfolioTabs } from "./portfolio-tabs.js";

const tabs = [
  { key: "assets", href: "/portfolio/assets" },
  { key: "listings", href: "/portfolio/listings", hideWhenEmpty: true },
  { key: "offers", href: "/portfolio/offers", hideWhenEmpty: true },
  { key: "activity", href: "/portfolio/activity" },
];
const keys = (list: Array<{ key: string }>) => list.map((t) => t.key);

test("a tab that can be hidden shows only when it has something", () => {
  expect(keys(visiblePortfolioTabs(tabs, { listings: true, offers: false }, "/portfolio/assets"))).toEqual(["assets", "listings", "activity"]);
});

test("tabs still loading stay hidden, the always-visible ones stay", () => {
  expect(keys(visiblePortfolioTabs(tabs, {}, "/portfolio/assets"))).toEqual(["assets", "activity"]);
});

test("the tab you are on stays visible even when empty", () => {
  expect(keys(visiblePortfolioTabs(tabs, { offers: false }, "/portfolio/offers"))).toEqual(["assets", "offers", "activity"]);
});

test("a page under a tab keeps that tab visible", () => {
  expect(keys(visiblePortfolioTabs(tabs, {}, "/portfolio/listings/0xabc"))).toEqual(["assets", "listings", "activity"]);
});

test("a path that only starts with the same letters does not count", () => {
  expect(keys(visiblePortfolioTabs(tabs, {}, "/portfolio/listings-archive"))).toEqual(["assets", "activity"]);
});
