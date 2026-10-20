import { expect, test, mock } from "bun:test";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { Home, Search } from "lucide-react";
import type { MedialaneApp } from "./medialane-app.js";

const pushed: string[] = [];
mock.module("next/navigation", () => ({ useRouter: () => ({ push: (href: string) => pushed.push(href) }) }));

const { NavCommandMenu, matchCommands, useNavCommandMenu } = await import("./nav-command-menu.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

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

const searches: unknown[][] = [];
const client = {
  api: {
    search: async (...args: unknown[]) => {
      searches.push(args);
      return {
        data: {
          creators: [{ walletAddress: "0xw1", username: "drummer", name: "Drum Kit", bio: null, avatarImage: null }],
          collections: [{ contractAddress: "0xc1", name: "Drum Loops", image: null, totalSupply: null, floorPrice: null, holderCount: null }],
          tokens: [{ contractAddress: "0xc1", tokenId: "7", name: "Drum Loop 7", image: null, owner: "0xw1", metadataStatus: "FETCHED" }],
        },
        query: args[0],
      };
    },
  },
} as unknown as MedialaneClient;
const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;

function Opener() {
  const { open } = useNavCommandMenu();
  return <button onClick={open}>open</button>;
}

async function openMenu(search: boolean) {
  const view = render(
    <MedialaneAppProvider value={app}>
      <Opener />
      <NavCommandMenu commands={commands} search={search} />
    </MedialaneAppProvider>
  );
  act(() => { fireEvent.click(view.getByText("open")); });
  const input = await waitFor(() => view.getByPlaceholderText("Search or run a command…"));
  return { view, input };
}

test("search shows creators, collections and assets and opens the selected one", async () => {
  pushed.length = 0;
  searches.length = 0;
  const { view, input } = await openMenu(true);
  fireEvent.change(input, { target: { value: "drum" } });

  await waitFor(() => expect(view.getByText("Drum Loop 7")).toBeTruthy());
  expect(view.getByText("@drummer")).toBeTruthy();
  expect(view.getByText("Drum Loops")).toBeTruthy();
  expect(view.getByText('All results for "drum"')).toBeTruthy();
  expect(searches).toEqual([["drum", 4]]);

  fireEvent.click(view.getByText("@drummer"));
  expect(pushed).toEqual(["/creator/drummer"]);
  view.unmount();
});

test("all results encodes the query", async () => {
  pushed.length = 0;
  const { view, input } = await openMenu(true);
  fireEvent.change(input, { target: { value: "#1 a" } });
  await waitFor(() => expect(view.getByText('All results for "#1 a"')).toBeTruthy());
  fireEvent.click(view.getByText('All results for "#1 a"'));
  expect(pushed).toEqual(["/search?q=%231%20a"]);
  view.unmount();
});

test("without search the menu only filters commands", async () => {
  searches.length = 0;
  const { view, input } = await openMenu(false);
  fireEvent.change(input, { target: { value: "find" } });

  await waitFor(() => expect(view.queryByText("Medialane")).toBeNull());
  expect(view.getByText("Search")).toBeTruthy();
  await new Promise((r) => setTimeout(r, 300));
  expect(view.queryByText(/All results/)).toBeNull();
  expect(searches).toEqual([]);
  view.unmount();
});
