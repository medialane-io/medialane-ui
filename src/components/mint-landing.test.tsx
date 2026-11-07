import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { MintLandingCopy } from "./mint-landing.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { MintLanding } = await import("./mint-landing.js");

afterEach(() => cleanup());

const COPY: MintLandingCopy = {
  image: { src: "/a.jpg", alt: "Campaign", fallback: "Campaign" },
  headline: { lead: "Join the", highlight: "Airdrop" },
  chips: ["Free to join", "Instant"],
  learnMore: "Learn more",
  fund: { title: "Fund", cards: [{ title: "One", body: "a" }, { title: "Two", body: "b" }, { title: "Three", body: "c" }] },
  how: {
    eyebrow: "How", title: "Join",
    account: { title: "Account", tag: "Minimum", body: "x" },
    create: { title: "Create", tag: "Bonus", body: "y" },
    trade: { title: "Trade", tag: "Biggest", body: "z" },
  },
  phases: {
    eyebrow: "Distribution", title: "Phases",
    first: { title: "Phase 1", tag: "5,000", body: "f" },
    second: { title: "Phase 2", tag: "10,000", body: "s" },
    note: "Targets only.",
  },
  eligibility: { eyebrow: "Eligibility", title: "Who", items: [{ ok: true, text: "Anyone" }, { ok: false, text: "Bots" }] },
  disclaimer: {
    title: "Disclaimer",
    paragraphs: ["Not a financial product."],
    agree: { lead: "You agree to the", campaignTerms: "Campaign Terms", and: "and", terms: "Terms" },
  },
  footer: { line: "Free ·", campaignTerms: "Campaign terms", links: { terms: "Terms", privacy: "Privacy", campaign: "Campaign", about: "About" } },
};

test("renders every chip and eligibility line from the copy", () => {
  render(<MintLanding copy={COPY} mint={null} />);
  for (const chip of COPY.chips) expect(screen.getByText(chip)).toBeTruthy();
  for (const { text } of COPY.eligibility.items) expect(screen.getByText(text)).toBeTruthy();
  expect(screen.getByText("Airdrop")).toBeTruthy();
});

test("renders the badge and intro only when the copy has them", () => {
  render(<MintLanding copy={COPY} mint={null} />);
  expect(screen.queryByText("Creator's Fund Campaign")).toBeNull();
  expect(screen.queryByText("About this campaign")).toBeNull();
  cleanup();
  render(<MintLanding copy={{ ...COPY, badge: "Creator's Fund Campaign", intro: "About this campaign" }} mint={null} />);
  expect(screen.getByText("Creator's Fund Campaign")).toBeTruthy();
  expect(screen.getByText("About this campaign")).toBeTruthy();
});

test("renders the mint slot", () => {
  render(<MintLanding copy={COPY} mint={<button>mint slot</button>} />);
  expect(screen.getByRole("button", { name: "mint slot" })).toBeTruthy();
});
