import { afterEach, expect, test } from "bun:test";

import { cleanup, render } from "@testing-library/react";
import { ActivateCard } from "./activate-card.js";
import { MediaWalletAppContext, type MediaWalletAppProps } from "./types.js";

afterEach(() => cleanup());

const app = { wallet: { completeDeployment: async () => {} } } as unknown as MediaWalletAppProps;
const renderCard = () =>
  render(
    <MediaWalletAppContext.Provider value={app}>
      <ActivateCard onActivated={() => {}} />
    </MediaWalletAppContext.Provider>,
  );

const JARGON = [/permissionless/i, /self custody/i, /\bonchain\b/i];

test("activation copy contains no crypto jargon", () => {
  renderCard();
  const text = document.body.textContent ?? "";
  for (const pattern of JARGON) {
    expect(pattern.test(text)).toBe(false);
  }
});

test("activation copy still communicates the account is free and gas-sponsored", () => {
  const { getByText } = renderCard();
  expect(getByText(/no gas fees/i)).toBeTruthy();
});
