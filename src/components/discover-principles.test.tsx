import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { DiscoverPrinciples } from "./discover-principles.js";

afterEach(() => cleanup());

test("shows ten principles, each with a title and one line", () => {
  const view = render(<DiscoverPrinciples />);
  const titles = view.container.querySelectorAll("dt");
  const lines = view.container.querySelectorAll("dd");
  expect(titles.length).toBe(10);
  expect(lines.length).toBe(10);
  expect(titles[0]?.textContent).toBe("99% to creators");
});

test("uses no technical wording", () => {
  const view = render(<DiscoverPrinciples />);
  const text = (view.container.textContent ?? "").toLowerCase();
  for (const word of ["blockchain", "contract", "starknet", "zero-knowledge", "stark", "immutable", "permissionless", "nft", "wallet", "gas"]) {
    expect(text.includes(word)).toBe(false);
  }
});
