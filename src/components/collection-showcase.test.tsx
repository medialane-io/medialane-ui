import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ApiCollection } from "@medialane/sdk";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { CollectionShowcase } = await import("./collection-showcase.js");

afterEach(() => cleanup());

const collection = (address: string, name: string, totalSupply: number | null = 3) =>
  ({ contractAddress: address, name, image: `ipfs://${name}`, totalSupply }) as unknown as ApiCollection;

const COLLECTIONS = [collection("0x1", "TAO", 2), collection("0x2", "Harmonia"), collection("0x3", "Open Canvas")];
const getHref = (c: ApiCollection) => `/collections/${c.contractAddress}`;

test("every featured collection is a card with its name and item count, all linking to the collection", () => {
  const view = render(<CollectionShowcase collections={COLLECTIONS} isLoading={false} getHref={getHref} />);

  expect(view.getByRole("heading", { level: 2, name: "TAO" })).toBeTruthy();
  expect(view.getByText("2 items")).toBeTruthy();
  expect(view.getAllByText("3 items")).toHaveLength(2);
  expect(view.getAllByText("Harmonia").length).toBeGreaterThan(0);
  for (const name of ["TAO", "Harmonia", "Open Canvas"]) {
    const links = view.getAllByRole("link", { name });
    expect(links.length).toBeGreaterThan(0);
  }
  const hrefs = view.getAllByRole("link").map((a) => a.getAttribute("href"));
  expect(hrefs).toContain("/collections/0x1");
  expect(hrefs).toContain("/collections/0x2");
  expect(hrefs).toContain("/collections/0x3");
});

test("the dots bring another collection to the front", () => {
  const view = render(<CollectionShowcase collections={COLLECTIONS} isLoading={false} getHref={getHref} />);

  fireEvent.click(view.getByRole("button", { name: "Show Harmonia" }));

  expect(view.getByRole("heading", { level: 2, name: "Harmonia" })).toBeTruthy();
  expect(view.getByRole("button", { name: "Show Harmonia" }).getAttribute("aria-current")).toBe("true");
  expect(view.queryByRole("heading", { level: 2, name: "TAO" })).toBeNull();
});

test("the arrow keys move between collections while the cards have focus, wrapping around", () => {
  const view = render(<CollectionShowcase collections={COLLECTIONS} isLoading={false} getHref={getHref} />);
  const stage = view.getByRole("group", { name: "Featured collections" });

  fireEvent.keyDown(stage, { key: "ArrowRight" });
  expect(view.getByRole("heading", { level: 2, name: "Harmonia" })).toBeTruthy();

  fireEvent.keyDown(stage, { key: "ArrowLeft" });
  fireEvent.keyDown(stage, { key: "ArrowLeft" });
  expect(view.getByRole("heading", { level: 2, name: "Open Canvas" })).toBeTruthy();
});

test("a single collection shows no dots", () => {
  const view = render(<CollectionShowcase collections={[COLLECTIONS[0]!]} isLoading={false} getHref={getHref} />);
  expect(view.queryAllByRole("button").length).toBe(0);
});

test("without featured collections it shows nothing", () => {
  const view = render(<CollectionShowcase collections={[]} isLoading={false} getHref={getHref} />);
  expect(view.container.innerHTML).toBe("");
});

test("while loading it shows a skeleton without any heading", () => {
  const view = render(<CollectionShowcase collections={[]} isLoading getHref={getHref} />);
  expect(view.queryByRole("heading")).toBeNull();
});
