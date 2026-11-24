import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AccountLoading, ActivitiesLoading, CollectionLoading, CollectionsLoading, CreatorLoading, IpTypeLoading, MarketplaceLoading, PortfolioLoading } from "./page-skeletons.js";

afterEach(cleanup);

test("the account loading screen follows the account page: text header, pill tabs and token cards", () => {
  const { container } = render(<AccountLoading />);
  expect(container.querySelectorAll(".rounded-2xl.bg-card")).toHaveLength(8);
  expect(container.querySelectorAll(".rounded-full.h-9")).toHaveLength(4);
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
  expect(container.querySelector(".rounded-2xl.h-10")).not.toBeNull();
});

test("the IP type loading screen shows the page header and token card skeletons", () => {
  const { container } = render(<IpTypeLoading />);
  expect(container.querySelectorAll(".rounded-2xl.bg-card")).toHaveLength(10);
  expect(container.querySelector(".h-9.w-64")).not.toBeNull();
});

test("the creator loading screen follows the creator page: header block, tab row and token cards", () => {
  const { container } = render(<CreatorLoading />);
  expect(container.querySelectorAll(".rounded-2xl.bg-card")).toHaveLength(8);
  expect(container.querySelector(".h-48")).toBeNull();
  expect(container.querySelector(".h-\\[88px\\]")).toBeNull();
  expect(container.querySelectorAll(".px-4.py-3")).toHaveLength(4);
});

test("the activities loading screen shows the title, seven filter pills and ten rows", () => {
  const { container } = render(<ActivitiesLoading />);
  expect(container.querySelectorAll(".rounded-full.h-7")).toHaveLength(7);
  expect(container.querySelectorAll(".divide-y > div")).toHaveLength(10);
});

test("the portfolio loading screen fills only the content slot with token cards, under the shell header", () => {
  const { container } = render(<PortfolioLoading />);
  expect(container.querySelectorAll(".rounded-2xl.bg-card")).toHaveLength(10);
  expect(container.querySelector(".h-9.w-36")).toBeNull();
});
