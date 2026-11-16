import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AccountLoading, CollectionLoading, CollectionsLoading, IpTypeLoading, MarketplaceLoading } from "./page-skeletons.js";

afterEach(cleanup);

test("the account loading screen follows the account page: text header, pill tabs and token cards", () => {
  const { container } = render(<AccountLoading />);
  expect(container.querySelectorAll(".card-base")).toHaveLength(8);
  expect(container.querySelectorAll(".rounded-full.h-9")).toHaveLength(5);
  expect(container.querySelector(".h-48")).toBeNull();
  expect(container.querySelector(".h-\\[88px\\]")).toBeNull();
});

test("the marketplace loading screen shows listing card skeletons in the page grid, not bordered boxes", () => {
  const { container } = render(<MarketplaceLoading />);
  expect(container.querySelectorAll(".grid > div")).toHaveLength(15);
  expect(container.querySelector(".border.border-border.rounded-xl")).toBeNull();
});

test("the collections loading screen shows ten collection card skeletons", () => {
  const { container } = render(<CollectionsLoading />);
  expect(container.querySelectorAll(".grid > div")).toHaveLength(10);
});

test("the collection loading screen shows the header, the tab row and a grid of asset skeletons", () => {
  const { container } = render(<CollectionLoading />);
  expect(container.querySelectorAll(".aspect-square").length).toBeGreaterThanOrEqual(11);
  expect(container.querySelector(".rounded-lg.h-10")).not.toBeNull();
});

test("the IP type loading screen shows the title row and token card skeletons", () => {
  const { container } = render(<IpTypeLoading />);
  expect(container.querySelectorAll(".card-base")).toHaveLength(10);
  expect(container.querySelector(".h-14.w-14")).not.toBeNull();
});
