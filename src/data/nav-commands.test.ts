import { expect, test } from "bun:test";
import { Star } from "lucide-react";
import { NAV_ITEMS, navGroups } from "./nav-commands.js";
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
    { heading: "Navigate", items: ["creators", own, "collections"] },
  ]);
  expect(groups.map((g) => g.heading)).toEqual([undefined, "Navigate"]);
  expect(groups[0]!.items.map((i) => i.id)).toEqual(["home", "discover"]);
  expect(groups[1]!.items.map((i) => i.id)).toEqual(["creators", "own", "collections"]);
  expect(groups[1]!.items[1]).toBe(own);
  expect(groups[0]!.items[0]).toBe(NAV_ITEMS.home);
});
