import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiCreatorProfile } from "@medialane/sdk";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { CreatorHeader } = await import("./creator-header.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

const app = { getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
const creator = {
  walletAddress: "0x0123456789abcdef",
  chain: "STARKNET",
  username: "rodrigo",
  name: "Rodrigo K",
  bio: "Drums and recordings",
  avatarImage: null,
  websiteUrl: "https://example.com",
  twitterUrl: null,
  discordUrl: null,
  telegramUrl: null,
  updatedAt: "2026-10-20",
} as ApiCreatorProfile;

const render = (c: ApiCreatorProfile | null, loading = false) =>
  renderToStaticMarkup(
    <MedialaneAppProvider value={app}>
      <CreatorHeader creator={c} image={null} loading={loading} stats={[{ label: "Assets", value: 12 }, { label: "Collections", value: null }]}>
        <span>app actions</span>
      </CreatorHeader>
    </MedialaneAppProvider>,
  );

test("shows the creator beside their image", () => {
  const html = render(creator);
  expect(html).toContain("Rodrigo K");
  expect(html).toContain("@rodrigo");
  expect(html).toContain("Drums and recordings");
  expect(html).toContain("Assets");
  expect(html).toContain("https://example.com");
  expect(html).toContain("app actions");
  expect(html).not.toContain("0x0123");
});

test("unknown stats are hidden", () => {
  expect(render(creator)).not.toContain("Collections");
});

test("without a name the username is the title", () => {
  const html = render({ ...creator, name: null });
  expect(html).toContain("@rodrigo");
  expect(html).not.toContain("Rodrigo K");
});

test("loading shows a skeleton", () => {
  expect(render(null, true)).not.toContain("@rodrigo");
});
