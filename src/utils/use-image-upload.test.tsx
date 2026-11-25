import { afterAll, afterEach, expect, test } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { useImageUpload } from "./use-image-upload.js";

const uploads: string[] = [];
const originalFetch = global.fetch;
global.fetch = (async (_url: unknown, init?: { body?: FormData }) => {
  const file = init?.body?.get("file") as File | null;
  if (file) uploads.push(file.name);
  return { ok: true, json: async () => ({ data: { cid: "bafycid" } }) } as Response;
}) as unknown as typeof fetch;
afterAll(() => { global.fetch = originalFetch; });
(globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
(globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};
afterEach(() => cleanup());

function setup(ensureSignedIn?: () => Promise<void>, signedUrl = async () => ({ data: { url: "https://upload.example/signed" } })) {
  const app = { getClient: () => ({ api: { metadata: { signedUrl } } }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xa", onRequireWallet: () => {}, ensureSignedIn } as MedialaneApp;
  return renderHook(() => useImageUpload(), {
    wrapper: ({ children }: { children: React.ReactNode }) => <MedialaneAppProvider value={app}>{children}</MedialaneAppProvider>,
  });
}

test("uploads a valid image after the account is signed in", async () => {
  let signedIn = 0;
  const view = setup(async () => { signedIn += 1; });
  await act(() => view.result.current.select(new File(["x"], "cover.png", { type: "image/png" })));
  expect(signedIn).toBe(1);
  expect(uploads).toContain("cover.png");
  expect(view.result.current.uri).toBe("ipfs://bafycid");
});

test("rejects a file that is not an image without uploading", async () => {
  uploads.length = 0;
  const view = setup();
  await act(() => view.result.current.select(new File(["x"], "notes.txt", { type: "text/plain" })));
  expect(uploads).toEqual([]);
  expect(view.result.current.error).toStartWith("Choose an image in ");
});

test("a refused upload link is reported with the reason given", async () => {
  const view = setup(undefined, async () => { throw new Error("Storage limit reached"); });
  await act(() => view.result.current.select(new File(["x"], "cover.png", { type: "image/png" })));
  expect(view.result.current.error).toBe("Image upload failed: Storage limit reached");
});
