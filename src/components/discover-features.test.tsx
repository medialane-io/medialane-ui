import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { DiscoverFeatures } from "./discover-features.js";

afterEach(() => cleanup());

test("shows the thirteen features as a titled carousel of cards", () => {
  const view = render(<DiscoverFeatures />);
  const titles = Array.from(view.container.querySelectorAll("h3")).map((h) => h.textContent);
  expect(titles).toEqual([
    "99% to creators and owners",
    "Censorship resistance",
    "Stark cryptography",
    "Privacy by design",
    "Zero knowledge proof with Starknet",
    "Zero fees on protocols",
    "Immutable smart contracts",
    "Permissionless",
    "Smart contracts are the source of truth",
    "Programmable IP",
    "Immutable assets",
    "IP protection compliance",
    "Open source and auditable",
  ]);
  expect(view.container.querySelectorAll("li svg").length).toBe(13);
  expect(view.container.querySelectorAll("p").length).toBe(0);
});
