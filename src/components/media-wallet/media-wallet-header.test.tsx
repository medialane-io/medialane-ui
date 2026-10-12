import { afterEach, expect, test, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost:3000" });

mock.module("next/image", () => ({
  default: ({ src }: { src?: string }) => <div data-testid="avatar-image" data-src={src} />,
}));

const { cleanup, render } = await import("@testing-library/react");
const { MediaWalletHeader } = await import("./media-wallet-header.js");
const { MediaWalletAppContext } = await import("./types.js");
import type { MediaWalletAppProps } from "./types.js";

afterEach(() => cleanup());

const ADDRESS = "0x36a8000000000000000000000000000000000020d2";
const renderHeader = (app: Partial<MediaWalletAppProps>) =>
  render(
    <MediaWalletAppContext.Provider value={{ useAccountEmail: () => null, ...app } as MediaWalletAppProps}>
      <MediaWalletHeader address={ADDRESS} onNavigate={() => {}} />
    </MediaWalletAppContext.Provider>,
  );

test("without an identity it shows the wallet icon and the short address", () => {
  const { getByText, getByTestId } = renderHeader({});
  expect(getByText(/0x36a8…20d2/i)).toBeTruthy();
  expect(getByTestId("avatar-image").getAttribute("data-src")).toBe("/icon.png");
});

test("with an identity it shows the app's avatar, headline and badge", () => {
  const { getByText, queryByText, getByTestId } = renderHeader({
    useHeaderIdentity: () => ({ avatarUrl: "https://img/avatar.png", headline: "@mochi", badge: <span>Level 3</span> }),
  });
  expect(getByText("@mochi")).toBeTruthy();
  expect(queryByText(/0x36a8…20d2/i)).toBeNull();
  expect(getByTestId("avatar-image").getAttribute("data-src")).toBe("https://img/avatar.png");
  expect(getByText("Level 3")).toBeTruthy();
});

test("shows the account email when there is one", () => {
  const { getByText } = renderHeader({ useAccountEmail: () => "me@example.com" });
  expect(getByText("me@example.com")).toBeTruthy();
});

test("asks the app for the identity of the wallet it shows", () => {
  const asked: string[] = [];
  renderHeader({ useHeaderIdentity: (address) => { asked.push(address); return {}; } });
  expect(asked[0]).toBe(ADDRESS);
});
