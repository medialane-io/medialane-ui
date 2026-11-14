import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { DiscoverFeatures } from "./discover-features.js";

afterEach(() => cleanup());

test("shows the thirteen features as a carousel of cards under the section title", () => {
  const view = render(<DiscoverFeatures />);
  expect(view.getByRole("heading", { name: "Medialane features" })).toBeTruthy();
  const titles = Array.from(view.container.querySelectorAll("h3")).map((h) => h.textContent);
  expect(titles).toEqual([
    "Creator-first economy",
    "Censorship resistance",
    "Stark cryptography",
    "Privacy by design",
    "Zero knowledge",
    "Zero-fee protocols",
    "Immutable contracts",
    "Permissionless",
    "Onchain as the source of truth",
    "Programmable IP",
    "Decentralized portfolio",
    "Protection compliance",
    "Open source and auditable",
  ]);
  expect(view.container.querySelectorAll("h3").length).toBe(13);
  const descriptions = Array.from(view.container.querySelectorAll("p")).map((p) => p.textContent);
  expect(descriptions.length).toBe(13);
  expect(descriptions.every((text) => text && text.length > 0)).toBe(true);
  expect(descriptions[0]).toBe("99% to creators/owners + 1% fee goes to the Creator Fund Airdrop.");
  expect(view.container.querySelectorAll("a").length).toBe(0);
});
