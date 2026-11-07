import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { UserFacingError } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { CollectionSettings } = await import("./collection-settings.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";

function renderSettings(app: Partial<MedialaneApp>, opts: { owner?: string; claims?: { contractAddress: string; slug: string; status: string }[] } = {}) {
  const saved: unknown[] = [];
  const claimed: string[] = [];
  const collections = {
    get: async () => ({ contractAddress: "0xc1", name: "Loops", owner: opts.owner ?? ME }),
    findProfile: async () => ({ contractAddress: "0xc1", chain: "STARKNET", displayName: "Loops", description: null, image: null, bannerImage: null, websiteUrl: null, twitterUrl: null, discordUrl: null, telegramUrl: null, hasGatedContent: false, gatedContentTitle: null, slug: null }),
    updateProfile: async (_c: string, body: unknown) => { saved.push(body); return {}; },
    mySlugClaims: async () => ({ claims: opts.claims ?? [] }),
    slugAvailability: async () => ({ available: true }),
    submitSlugClaim: async (_c: string, slug: string) => { claimed.push(slug); return { claim: { slug } }; },
  };
  const client = { api: { collections } } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {}, ...app } as MedialaneApp;
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={value}><CollectionSettings contract="0xc1" /></MedialaneAppProvider></SWRConfig>);
  return { view, saved, claimed };
}

test("a visitor who does not own the collection sees the owner-only screen", async () => {
  const { view } = renderSettings({}, { owner: OTHER });
  await waitFor(() => expect(view.getByText("Owner access only")).toBeTruthy());
  expect(view.queryByText("Save changes")).toBeNull();
});

test("saving makes sure the account is signed in, then sends the profile", async () => {
  const order: string[] = [];
  const { view, saved } = renderSettings({ ensureSignedIn: async () => { order.push("signed in"); } });
  await waitFor(() => expect((view.getByLabelText("Display name") as HTMLInputElement).value).toBe("Loops"));
  fireEvent.change(view.getByLabelText("Website"), { target: { value: "https://loops.xyz" } });
  fireEvent.click(view.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(view.getByText("Saved")).toBeTruthy());
  expect(order).toEqual(["signed in"]);
  expect(saved[0]).toEqual(expect.objectContaining({ displayName: "Loops", websiteUrl: "https://loops.xyz", gatedContentUrl: null }));
});

test("a failed sign-in shows the error and sends nothing", async () => {
  const { view, saved } = renderSettings({ ensureSignedIn: async () => { throw new UserFacingError("Secure your account first"); } });
  await waitFor(() => expect((view.getByLabelText("Display name") as HTMLInputElement).value).toBe("Loops"));
  fireEvent.click(view.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(view.getByText("Secure your account first")).toBeTruthy());
  expect(saved.length).toBe(0);
});

test("a pending URL claim for this collection shows as under review", async () => {
  const { view } = renderSettings({}, { claims: [{ contractAddress: "0xc1", slug: "loops", status: "PENDING" }] });
  await waitFor(() => expect(view.getByText("Pending review")).toBeTruthy());
});

test("a free URL can be checked and claimed", async () => {
  const { view, claimed } = renderSettings({ ensureSignedIn: async () => {} });
  await waitFor(() => expect(view.getByPlaceholderText("your-name")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("your-name"), { target: { value: "loops" } });
  fireEvent.click(view.getByRole("button", { name: "Check" }));
  await waitFor(() => expect(view.getByRole("button", { name: "Claim this URL" })).toBeTruthy());
  fireEvent.click(view.getByRole("button", { name: "Claim this URL" }));
  await waitFor(() => expect(claimed).toEqual(["loops"]));
});
