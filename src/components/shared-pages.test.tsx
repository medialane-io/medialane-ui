import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { JourneyContent } = await import("./journey-content.js");
const { RouteError } = await import("./route-error.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");
const { PortfolioSnapshot } = await import("./settings-snapshots.js");

afterEach(() => cleanup());

test("the journey's start card asks for sign-in through the app and shows the app's hint", () => {
  let asked = 0;
  const client = { api: { rewards: { config: async () => null } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => { asked++; } } as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}><JourneyContent startHint="Get started in seconds." /></MedialaneAppProvider>
    </SWRConfig>,
  );
  fireEvent.click(view.getByText("Get started in seconds."));
  expect(asked).toBe(1);
});

test("the route error shows the error id and reloads on request", () => {
  const originalError = console.error;
  console.error = () => {};
  const originalReload = window.location.reload;
  let reloads = 0;
  Object.defineProperty(window.location, "reload", { configurable: true, value: () => { reloads++; } });
  const view = render(<RouteError error={Object.assign(new Error("boom"), { digest: "abc123" })} />);
  console.error = originalError;
  expect(view.getByText("Error ID: abc123")).toBeTruthy();
  expect(view.queryByText(/ready to reload/)).toBeNull();
  fireEvent.click(view.getByRole("button", { name: /Reload/ }));
  Object.defineProperty(window.location, "reload", { configurable: true, value: originalReload });
  expect(reloads).toBe(1);
});

test("the portfolio snapshot lists the counts and links to the portfolio", () => {
  const view = render(<PortfolioSnapshot assets={4} listings={2} collections={1} />);
  expect(view.getByText("4")).toBeTruthy();
  expect(view.getByText("View portfolio").closest("a")?.getAttribute("href")).toBe("/portfolio");
});
