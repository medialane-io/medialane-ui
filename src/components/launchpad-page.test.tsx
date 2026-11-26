import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { LaunchpadPage } = await import("./launchpad-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

function renderPage(props: Partial<Parameters<typeof LaunchpadPage>[0]> = {}) {
  const client = { api: { collections: { list: async () => ({ data: [] }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><LaunchpadPage fastMint={<div>app fast mint</div>} {...props} /></MedialaneAppProvider></SWRConfig>);
}

test("shows the app's quick mint first, then a section for each kind of service", () => {
  const view = renderPage();
  expect(view.getByText("Creator Launchpad")).toBeTruthy();
  const text = view.container.textContent ?? "";
  expect(text.indexOf("app fast mint")).toBeLessThan(text.indexOf("Single NFT"));
  for (const title of ["NFTs", "Collections", "Coins", "Membership", "Licensing", "Claims"]) {
    expect(view.getByRole("heading", { name: title })).toBeTruthy();
  }
});

test("each section can be reached from the jump bar", () => {
  const view = renderPage();
  const nav = view.getByRole("navigation", { name: "Launchpad sections" });
  for (const title of ["NFTs", "Collections", "Coins", "Membership", "Licensing", "Claims"]) {
    expect(nav.textContent).toContain(title);
  }
  expect(view.container.querySelector("#launchpad-licensing")).toBeTruthy();
});

test("the memecoin claim is in Coins and the collection name claim is not on the launchpad", () => {
  const view = renderPage();
  const coins = view.container.querySelector("#launchpad-coins")?.textContent ?? "";
  expect(coins).toContain("Creator Coin");
  expect(coins).toContain("Existing Memecoin");
  expect(view.container.textContent).not.toContain("Collection Address");
});

test("an app can hide a whole section", () => {
  const view = renderPage({ hideGroups: ["claims"] });
  expect(view.container.querySelector("#launchpad-claims")).toBeNull();
  expect(view.getByRole("navigation", { name: "Launchpad sections" }).textContent).not.toContain("Claims");
});

test("an app can leave out single services, and an empty section disappears", () => {
  const view = renderPage({ excludeKeys: ["ip-sponsorship"] });
  expect(view.container.querySelector("#launchpad-licensing")).toBeNull();
});

test("searching narrows the sections to what matches", async () => {
  const { fireEvent } = await import("@testing-library/react");
  const view = renderPage();
  fireEvent.change(view.getByPlaceholderText("Search services"), { target: { value: "ticket" } });
  expect(view.container.querySelector("#launchpad-membership")).toBeTruthy();
  expect(view.container.querySelector("#launchpad-coins")).toBeNull();
});
