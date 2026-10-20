import { expect, test } from "bun:test";
import { Home, Search } from "lucide-react";
import { matchCommands } from "./nav-command-menu.js";

const commands = [
  { items: [{ id: "home", label: "Medialane", icon: Home, href: "/", keywords: ["home"] }] },
  { heading: "Navigate", items: [{ id: "search", label: "Search", icon: Search, href: "/search", keywords: ["find"] }] },
];

test("matchCommands matches labels and keywords and drops the rest", () => {
  expect(matchCommands(commands, "home").map((c) => c.id)).toEqual(["home"]);
  expect(matchCommands(commands, "find").map((c) => c.id)).toEqual(["search"]);
  expect(matchCommands(commands, "zzzz")).toEqual([]);
  expect(matchCommands(commands, "  ")).toEqual([]);
});

test("matchCommands puts the closest match first", () => {
  const ranked = [
    { items: [
      { id: "my-collections", label: "My Collections", icon: Home, href: "/portfolio/collections" },
      { id: "collections", label: "Collections", icon: Home, href: "/collections" },
    ] },
  ];
  expect(matchCommands(ranked, "collections")[0]?.id).toBe("collections");
});
