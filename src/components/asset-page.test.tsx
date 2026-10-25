import { afterEach, expect, test, mock } from "bun:test";

mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {} }) }));
mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
const { MotionGlobalConfig } = await import("framer-motion");
MotionGlobalConfig.skipAnimations = true;
globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: {} } }))) as unknown as typeof fetch;

const { cleanup, render, waitFor } = await import("@testing-library/react");
const { SWRConfig } = await import("swr");
const { AssetPage, detectAssetKind } = await import("./asset-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");
import type { ApiCollection, ApiToken } from "@medialane/sdk";
import type { MedialaneApp } from "./medialane-app.js";

afterEach(() => cleanup());

const token = (over: Partial<ApiToken> = {}) =>
  ({
    chain: "STARKNET",
    contractAddress: "0xc0",
    tokenId: "1",
    standard: "ERC721",
    owner: "0xowner",
    metadata: { name: "Stones", description: "We could be heroes", image: null, attributes: [] },
    ...over,
  }) as unknown as ApiToken;

const collection = (over: Partial<ApiCollection> = {}) =>
  ({ chain: "STARKNET", contractAddress: "0xc0", name: "Heroes", standard: "ERC721", service: null, ...over }) as unknown as ApiCollection;

const clientFor = (t: ApiToken, c: ApiCollection) => ({
  api: new Proxy(
    { tokens: { get: async () => t, balance: async () => ({ owner: "0xme", amount: "0" }) }, collections: { get: async () => c }, chainReads: { ticket: async () => ({ maxSupply: "500", minted: "407", startTime: null, endTime: null, royaltyBps: 0 }), ipNftTokenData: async () => null } } as Record<string, unknown>,
    { get: (target, key: string) => target[key] ?? (async () => ({ data: [], meta: { total: 0 } })) },
  ),
});

const opened: string[] = [];
const useMarketActions = () => ({
    isProcessing: false,
    buy: () => opened.push("buy"),
    list: () => opened.push("list"),
    offer: () => opened.push("offer"),
    transfer: () => opened.push("transfer"),
    cancel: () => {},
    acceptBid: () => {},
    dialogs: <div>app dialogs</div>,
});

const renderPage = (t: ApiToken, c: ApiCollection) => {
  const app = { getClient: () => clientFor(t, c), getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as unknown as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MedialaneAppProvider value={app}>
        <AssetPage contract="0xc0" tokenId="1" useMarketActions={useMarketActions} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
};

test("asset kind comes from the collection's service, then the token standard", () => {
  expect(detectAssetKind("ip-tickets", "ERC1155")).toBe("ticket");
  expect(detectAssetKind("ip-club", "ERC1155")).toBe("membership");
  expect(detectAssetKind(null, "ERC1155")).toBe("edition");
  expect(detectAssetKind(null, "ERC721")).toBe("standard");
});

test("a standard asset shows the header, marketplace and the app's market dialogs", async () => {
  const { getByText, queryByText } = renderPage(token(), collection());
  await waitFor(() => expect(getByText("Stones")).toBeTruthy());
  expect(getByText("We could be heroes")).toBeTruthy();
  expect(getByText("Markets")).toBeTruthy();
  expect(getByText("app dialogs")).toBeTruthy();
  expect(queryByText("Ticket")).toBeNull();
});

test("a ticket shows its ticket panel", async () => {
  const { getByText, queryByText } = renderPage(token({ standard: "ERC1155" }), collection({ standard: "ERC1155", service: "ip-tickets" }));
  await waitFor(() => expect(getByText("Ticket")).toBeTruthy());
  expect(queryByText(/valid/i)).toBeNull();
});

test("a POP has no marketplace", async () => {
  const { getByText, queryByText } = renderPage(token(), collection({ service: "pop-protocol" }));
  await waitFor(() => expect(getByText("Stones")).toBeTruthy());
  expect(getByText("POP")).toBeTruthy();
  expect(queryByText("Markets")).toBeNull();
});

test("the explorer, share and report icons sit below the collection card", async () => {
  const { container, getByText } = renderPage(token(), collection());
  await waitFor(() => expect(getByText("Stones")).toBeTruthy());
  const html = container.innerHTML;
  const icons = html.indexOf('title="View contract"');
  const card = html.lastIndexOf('href="/collections/');
  expect(icons).toBeGreaterThan(-1);
  expect(icons).toBeGreaterThan(card);
});

const publication = (metadata: Record<string, unknown>) =>
  token({ metadata: { name: "Essay", image: null, attributes: [], ipType: "Publications", ...metadata } as unknown as ApiToken["metadata"] });

test("a publication reads as an article, with the text in paragraphs and no cut-off", async () => {
  const { getByText, getAllByText, queryByText } = renderPage(
    publication({ description: "First paragraph.\n\nSecond paragraph." }),
    collection({ name: "Ambrosia" }),
  );
  await waitFor(() => expect(getByText("Essay")).toBeTruthy());
  expect(getByText("First paragraph.")).toBeTruthy();
  expect(getByText("Second paragraph.")).toBeTruthy();
  expect(getAllByText("Ambrosia").length).toBe(1);
  expect(queryByText("Show more")).toBeNull();
  expect(getByText("Markets")).toBeTruthy();
  expect(getByText("app dialogs")).toBeTruthy();
});

test("a publication with no text keeps the standard layout", async () => {
  const { getByText, container } = renderPage(publication({ description: null }), collection());
  await waitFor(() => expect(getByText("Essay")).toBeTruthy());
  expect(container.querySelector("article")).toBeNull();
});

test("other types keep the standard layout", async () => {
  const { getByText, container } = renderPage(publication({ ipType: "Art", description: "Plain" }), collection());
  await waitFor(() => expect(getByText("Essay")).toBeTruthy());
  expect(getByText("Plain")).toBeTruthy();
  expect(container.querySelector("article")).toBeNull();
});

test("a publication offers its external URL as a Read more button after the text", async () => {
  const { getByText, container } = renderPage(
    publication({ description: "Text", externalUrl: "https://www.ambrosia.com.br/post" }),
    collection(),
  );
  await waitFor(() => expect(getByText("Read more")).toBeTruthy());
  const link = container.querySelector('article a[href="https://www.ambrosia.com.br/post"]')!;
  expect(link.textContent).toBe("Read more");
  expect(link.getAttribute("rel")).toContain("noopener");
});

test("a publication shows no Read more for the platform default or an unsafe link", async () => {
  const first = renderPage(publication({ description: "Text", externalUrl: "https://medialane.io" }), collection());
  await waitFor(() => expect(first.container.querySelector("article")).toBeTruthy());
  expect(first.queryByText("Read more")).toBeNull();
  cleanup();
  const second = renderPage(publication({ description: "Text", externalUrl: "javascript:alert(1)" }), collection());
  await waitFor(() => expect(second.container.querySelector("article")).toBeTruthy());
  expect(second.queryByText("Read more")).toBeNull();
});

test("other assets show their external URL after the description", async () => {
  const { getByText, container } = renderPage(publication({ ipType: "Art", description: "Plain", externalUrl: "https://artist.test/work" }), collection());
  await waitFor(() => expect(getByText("Open link")).toBeTruthy());
  expect(container.querySelector('a[href="https://artist.test/work"]')!.textContent).toBe("Open link");
});

test("a publication shows its author after the text: the Author trait, else the Creator", async () => {
  const named = renderPage(publication({ description: "Text", attributes: [{ trait_type: "Creator", value: "J.R. Dib" }] }), collection());
  await waitFor(() => expect(named.container.querySelector("article")).toBeTruthy());
  expect(named.container.querySelector("article")!.textContent).toContain("J.R. Dib");
  cleanup();
  const authored = renderPage(
    publication({ description: "Text", attributes: [{ trait_type: "Author", value: "Ana" }, { trait_type: "Creator", value: "J.R. Dib" }] }),
    collection(),
  );
  await waitFor(() => expect(authored.container.querySelector("article")).toBeTruthy());
  expect(authored.container.querySelector("article")!.textContent).toContain("Ana");
  expect(authored.container.querySelector("article")!.textContent).not.toContain("J.R. Dib");
});

test("a publication keeps its rights in the overview like other assets", async () => {
  const attributes = [
    { trait_type: "License", value: "CC BY-SA" },
    { trait_type: "Commercial Use", value: "Yes" },
    { trait_type: "Derivatives", value: "Share-Alike" },
  ];
  const { getByText } = renderPage(publication({ description: "Lead.\n\nBody.", attributes }), collection());
  await waitFor(() => expect(getByText("Lead.")).toBeTruthy());
  expect(getByText("Rights")).toBeTruthy();
  expect(getByText("CC BY-SA")).toBeTruthy();
});

test("a publication has no publisher row above the title", async () => {
  const { getByText, getAllByText } = renderPage(publication({ description: "Lead.\n\nBody." }), collection({ name: "Ambrosia" }));
  await waitFor(() => expect(getByText("Lead.")).toBeTruthy());
  expect(getAllByText("Ambrosia").length).toBe(1);
});

test("the type icon carries its label on publications and on other assets", async () => {
  const first = renderPage(publication({ description: "Lead.\n\nBody." }), collection());
  await waitFor(() => expect(first.getByText("Lead.")).toBeTruthy());
  expect(first.getByText("Publications")).toBeTruthy();
  cleanup();
  const second = renderPage(publication({ ipType: "Art", description: "Plain" }), collection());
  await waitFor(() => expect(second.getByText("Plain")).toBeTruthy());
  expect(second.getByText("Art")).toBeTruthy();
});

const video = (metadata: Record<string, unknown>) =>
  token({ metadata: { name: "Alice Video", description: "Alice, an original song", image: null, ipType: "Video", attributes: [], ...metadata } as unknown as ApiToken["metadata"] });

const youtube = [{ trait_type: "YouTube URL", value: "https://www.youtube.com/watch?v=abc123" }];

test("a video with a playable link opens as a watch page with the player first", async () => {
  const { getByText, container } = renderPage(video({ attributes: youtube }), collection({ name: "Kalamaha" }));
  await waitFor(() => expect(getByText("Alice Video")).toBeTruthy());
  const frames = container.querySelectorAll("iframe");
  expect(frames.length).toBe(1);
  expect(frames[0].getAttribute("src")).toBe("https://www.youtube.com/embed/abc123");
  expect(getByText("Alice, an original song")).toBeTruthy();
  expect(getByText("Video")).toBeTruthy();
  expect(getByText("Markets")).toBeTruthy();
  expect(getByText("app dialogs")).toBeTruthy();
});

test("a video does not repeat its player in the overview", async () => {
  const { getByText, queryByText, container } = renderPage(video({ attributes: youtube }), collection());
  await waitFor(() => expect(getByText("Alice Video")).toBeTruthy());
  expect(container.querySelectorAll("iframe").length).toBe(1);
  expect(queryByText("YouTube")).toBeNull();
});

test("a video without a playable link keeps the standard layout", async () => {
  const { getByText, container } = renderPage(video({ attributes: [] }), collection());
  await waitFor(() => expect(getByText("Alice Video")).toBeTruthy());
  expect(container.querySelectorAll("iframe").length).toBe(0);
});

test("other types ignore a video link", async () => {
  const { getByText, container } = renderPage(video({ ipType: "Art", attributes: youtube }), collection());
  await waitFor(() => expect(getByText("Alice Video")).toBeTruthy());
  expect(container.querySelectorAll("iframe").length).toBe(0);
});

const audio = (metadata: Record<string, unknown>) =>
  token({ metadata: { name: "Chinese Alarm Clock", description: "A song by Kalamaha", image: null, ipType: "Audio", attributes: [], ...metadata } as unknown as ApiToken["metadata"] });

const spotify = [{ trait_type: "Spotify URL", value: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC" }];

test("an audio asset with a playable link opens with the player right under the title", async () => {
  const { getByText, container } = renderPage(audio({ attributes: spotify }), collection({ name: "Kalamaha Nó Samsara" }));
  await waitFor(() => expect(getByText("Chinese Alarm Clock")).toBeTruthy());
  const frames = container.querySelectorAll("iframe");
  expect(frames.length).toBe(1);
  expect(frames[0].getAttribute("src")).toContain("open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC");
  expect(getByText("A song by Kalamaha")).toBeTruthy();
  expect(getByText("Audio")).toBeTruthy();
  expect(getByText("Markets")).toBeTruthy();
});

test("an audio asset does not repeat its player in the overview", async () => {
  const { getByText, queryByText, container } = renderPage(audio({ attributes: spotify }), collection());
  await waitFor(() => expect(getByText("Chinese Alarm Clock")).toBeTruthy());
  expect(container.querySelectorAll("iframe").length).toBe(1);
  expect(queryByText("Spotify")).toBeNull();
});

test("an audio asset without a playable link keeps the standard layout", async () => {
  const { getByText, container } = renderPage(audio({ attributes: [] }), collection());
  await waitFor(() => expect(getByText("Chinese Alarm Clock")).toBeTruthy());
  expect(container.querySelectorAll("iframe").length).toBe(0);
});
