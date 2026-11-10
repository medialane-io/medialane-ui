import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { DiscoverFeatures } from "./discover-features.js";

afterEach(() => cleanup());

test("shows the thirteen features as a carousel of cards under the section title", () => {
  const view = render(<DiscoverFeatures />);
  expect(view.getByRole("heading", { name: "Medialane features" })).toBeTruthy();
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
  expect(view.container.querySelectorAll("h3").length).toBe(13);
  expect(view.container.querySelectorAll("p").length).toBe(0);
  expect(view.container.querySelectorAll("a").length).toBe(0);
});
