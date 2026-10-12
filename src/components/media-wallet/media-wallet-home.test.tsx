import { afterEach, expect, test, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost:3000" });

mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
mock.module("next/image", () => ({ default: () => <div /> }));
globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: {} } }))) as unknown as typeof fetch;

const { cleanup, render } = await import("@testing-library/react");
const { MediaWalletHome } = await import("./media-wallet-home.js");
const { MediaWalletAppContext } = await import("./types.js");
import type { MediaWalletAppProps } from "./types.js";

afterEach(() => cleanup());

const app = (over: Partial<MediaWalletAppProps>): MediaWalletAppProps =>
  ({
    getClient: () => ({ api: { getTokensByOwner: async () => ({ data: [] }) } }),
    provider: { callContract: async () => ["0x0", "0x0"] },
    useWalletSession: () => ({ address: "0x36a8000000000000000000000000000000000020d2", hasWallet: true, isDeployed: true, signer: null }),
    resolveImage: () => null,
    useAccountEmail: () => null,
    useEmailStatus: () => null,
    emailBanner: { href: "/verify", text: () => "" },
    externalWallet: { href: "https://wallet.example", label: "Use another wallet" },
    ...over,
  }) as unknown as MediaWalletAppProps;

const renderHome = (props: MediaWalletAppProps) =>
  render(
    <MediaWalletAppContext.Provider value={props}>
      <MediaWalletHome onNavigate={() => {}} onClose={() => {}} />
    </MediaWalletAppContext.Provider>,
  );

test("the email banner uses the app's link and text", () => {
  const { getByText } = renderHome(
    app({
      useEmailStatus: () => ({ email: "me@example.com", emailVerified: false, deadline: "2026-10-20" }),
      emailBanner: { href: "/settings/email", text: (deadline) => `Verify by ${deadline}` },
    }),
  );
  expect(getByText("Verify by 2026-10-20").closest("a")?.getAttribute("href")).toBe("/settings/email");
});

test("no email banner once the email is verified", () => {
  const { queryByText } = renderHome(
    app({ useEmailStatus: () => ({ email: "me@example.com", emailVerified: true }), emailBanner: { href: "/verify", text: () => "Verify soon" } }),
  );
  expect(queryByText("Verify soon")).toBeNull();
});

test("the external wallet link uses the app's label and address", () => {
  const { getByText } = renderHome(app({ externalWallet: { href: "https://starknet.example", label: "Use another Starknet wallet" } }));
  expect(getByText("Use another Starknet wallet").closest("a")?.getAttribute("href")).toBe("https://starknet.example");
});
