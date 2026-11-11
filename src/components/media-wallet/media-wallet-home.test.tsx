import { afterEach, expect, test, mock } from "bun:test";

mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {} }) }));
mock.module("next/image", () => ({ default: () => <div /> }));
globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: {} } }))) as unknown as typeof fetch;

const { cleanup, render, waitFor } = await import("@testing-library/react");
const { MediaWalletHome } = await import("./media-wallet-home.js");
const { MediaWalletAppContext } = await import("./types.js");
const { MedialaneAppProvider } = await import("../medialane-app.js");
import type { MediaWalletAppProps } from "./types.js";
import type { MedialaneApp } from "../medialane-app.js";

afterEach(() => {
  cleanup();
  ownedTokens = [];
});

const app = (over: Partial<MediaWalletAppProps>): MediaWalletAppProps =>
  ({
    useWalletSession: () => ({ address: "0x36a8000000000000000000000000000000000020d2", hasWallet: true, isDeployed: true, signer: null }),
    resolveImage: () => null,
    useAccountEmail: () => null,
    useEmailStatus: () => null,
    emailBanner: { href: "/verify", text: () => "" },
    externalWallet: { href: "https://wallet.example", label: "Use another wallet" },
    ...over,
  }) as unknown as MediaWalletAppProps;

let ownedTokens: unknown[] = [];

const medialaneApp = {
  getClient: () => ({
    api: { tokens: { ownedBy: async () => ({ data: ownedTokens }) } },
    provider: { callContract: async () => ["0x0", "0x0"] },
  }),
  getSigner: () => { throw new Error("unused"); },
  walletAddress: null,
  onRequireWallet: () => {},
} as unknown as MedialaneApp;

const renderHome = (props: MediaWalletAppProps) =>
  render(
    <MedialaneAppProvider value={medialaneApp}>
      <MediaWalletAppContext.Provider value={props}>
        <MediaWalletHome onNavigate={() => {}} onClose={() => {}} />
      </MediaWalletAppContext.Provider>
    </MedialaneAppProvider>,
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

test("without minted NFTs the NFTs title is not shown", async () => {
  const { queryByText, getByText } = renderHome(app({}));
  expect(queryByText("NFTs")).toBeNull();
  await waitFor(() => expect(getByText("Creator Launchpad")).toBeTruthy());
  expect(queryByText("NFTs")).toBeNull();
});

test("the Creator Launchpad card comes after the NFTs", async () => {
  ownedTokens = [{ contractAddress: "0xabc", tokenId: "1", metadata: { name: "One", image: null, ipType: null } }];
  const { getByText } = renderHome(
    app({ useWalletSession: () => ({ address: "0x36a8000000000000000000000000000000000030e3", hasWallet: true, isDeployed: true, signer: null }) } as never),
  );
  await waitFor(() => expect(getByText("NFTs")).toBeTruthy());
  const nfts = getByText("NFTs");
  const launchpad = getByText("Creator Launchpad");
  expect(nfts.compareDocumentPosition(launchpad) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("Fund your account is a soft button, not a filled one", () => {
  const { getByText } = renderHome(app({}));
  const button = getByText("Fund your account");
  expect(button.className).toContain("bg-foreground/[0.06]");
  expect(button.getAttribute("style")).toBeNull();
});
