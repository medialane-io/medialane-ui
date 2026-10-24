import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Users } from "lucide-react";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";
import { WalletRequired } from "./wallet-required.js";

afterEach(() => cleanup());

function renderGate(app: Partial<MedialaneApp>) {
  const full = { getClient: () => ({}) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {}, ...app } as MedialaneApp;
  return render(
    <MedialaneAppProvider value={full}>
      <WalletRequired icon={Users} title="Secure your account" description="Create a club first.">
        <p>the form</p>
      </WalletRequired>
    </MedialaneAppProvider>,
  );
}

test("asks for a wallet and offers the app's connect action", () => {
  let asked = 0;
  const view = renderGate({ onRequireWallet: () => { asked += 1; }, connectLabel: "Connect with email" });
  expect(view.getByText("Secure your account")).toBeTruthy();
  expect(view.queryByText("the form")).toBeNull();
  fireEvent.click(view.getByText("Connect with email"));
  expect(asked).toBe(1);
});

test("shows its children once there is a wallet", () => {
  const view = renderGate({ walletAddress: "0xa" });
  expect(view.getByText("the form")).toBeTruthy();
});

test("shows a placeholder while the wallet loads", () => {
  const view = renderGate({ walletLoading: true });
  expect(view.queryByText("Secure your account")).toBeNull();
  expect(view.queryByText("the form")).toBeNull();
});
