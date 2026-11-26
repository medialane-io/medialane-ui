import { expect, test } from "bun:test";
import { Star } from "lucide-react";
import { NAV_ITEMS, navGroups } from "./nav-commands.js";
import { getLaunchpadService } from "./launchpad-services.js";
import { LAUNCHPAD_ROUTE_OVERRIDES } from "../components/launchpad-services.js";
import type { NavCommand } from "../components/nav-command-menu.js";

test("every shared entry's id matches its key", () => {
  for (const [key, item] of Object.entries(NAV_ITEMS)) expect(item.id).toBe(key);
});

test("each entry lists a keyword once", () => {
  for (const item of Object.values(NAV_ITEMS) as NavCommand[]) {
    const keywords = item.keywords ?? [];
    expect(new Set(keywords).size).toBe(keywords.length);
  }
});

test("navGroups resolves shared ids in the app's order and keeps the app's own entries", () => {
  const own = { id: "own", label: "Own", icon: Star, href: "/own" };
  const groups = navGroups([
    { items: ["home", "discover"] },
    { heading: "Navigate", items: ["accounts", own, "collections"] },
  ]);
  expect(groups.map((g) => g.heading)).toEqual([undefined, "Navigate"]);
  expect(groups[0]!.items.map((i) => i.id)).toEqual(["home", "discover"]);
  expect(groups[1]!.items.map((i) => i.id)).toEqual(["accounts", "own", "collections"]);
  expect(groups[1]!.items[1]).toBe(own);
  expect(groups[0]!.items[0]).toBe(NAV_ITEMS.home);
});

test("every content type with a page has a shared entry that opens it", () => {
  expect(NAV_ITEMS.publications.href).toBe("/publications");
  expect(NAV_ITEMS.publications.label).toBe("Publications");
});

const CARD_LINKS = {
  "mint-ip-asset": "nfts",
  "mint-editions": "limited-editions",
  remix: "remix-asset",
  "create-collection": "create-collection",
  "create-1155": "create-1155",
  "nft-drop": "collection-drop",
  "launch-coin": "creator-coins",
  "pop-create": "pop-protocol",
  "tickets-create": "ip-tickets",
  "club-create": "ip-club",
  "sponsorship-create": "ip-sponsorship",
} as const;

test("each launchpad entry carries its card's name and opens the same page", () => {
  const items = NAV_ITEMS as Record<string, NavCommand>;
  for (const [id, key] of Object.entries(CARD_LINKS)) {
    expect(items[id]?.label).toBe(getLaunchpadService(key).title);
    expect(items[id]?.href).toBe(LAUNCHPAD_ROUTE_OVERRIDES[key]!.href);
  }
});

test("each launchpad page has one entry and none is a browse link", () => {
  const launchpad = (Object.values(NAV_ITEMS) as NavCommand[]).filter((item) => item.href?.startsWith("/launchpad/"));
  expect(launchpad.map((item) => item.id).sort()).toEqual(Object.keys(CARD_LINKS).sort());
  expect(launchpad.filter((item) => /browse/i.test(item.label))).toEqual([]);
});

test("the sponsorship card opens the offers page, where a sponsorship can also be created", () => {
  expect(LAUNCHPAD_ROUTE_OVERRIDES["ip-sponsorship"]!.href).toBe("/launchpad/sponsorship");
});
