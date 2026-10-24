import { afterAll, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";

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

import { useLaunchpadImageUpload } from "./use-launchpad-image-upload.js";

function setup(ensureSignedIn?: () => Promise<void>) {
  const app = { getClient: () => ({ api: { metadata: { signedUrl: async () => ({ data: { url: "https://upload.example/signed" } }) } } }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xa", onRequireWallet: () => {}, ensureSignedIn } as MedialaneApp;
  return renderHook(() => useLaunchpadImageUpload({ successMessage: "Image uploaded" }), {
    wrapper: ({ children }: { children: React.ReactNode }) => <MedialaneAppProvider value={app}>{children}</MedialaneAppProvider>,
  });
}

test("uploads a valid image after the account is signed in", async () => {
  let signedIn = 0;
  const view = setup(async () => { signedIn += 1; });
  await act(async () => { await view.result.current.handleImageSelect(new File(["x"], "cover.png", { type: "image/png" })); });
  expect(signedIn).toBe(1);
  expect(uploads).toContain("cover.png");
  expect(view.result.current.imageUri).toBe("ipfs://bafycid");
  expect(view.result.current.uploadSuccess).toBe("Image uploaded");
  expect(view.result.current.imagePreview).toBe("blob:preview");
});

test("rejects a file that is not an image without uploading", async () => {
  uploads.length = 0;
  const view = setup();
  await act(async () => { await view.result.current.handleImageSelect(new File(["x"], "notes.txt", { type: "text/plain" })); });
  expect(uploads).toEqual([]);
  expect(view.result.current.uploadError).toBeTruthy();
  expect(view.result.current.imageUri).toBeNull();
});

test("clearImage forgets the file and its preview", async () => {
  const view = setup();
  await act(async () => { await view.result.current.handleImageSelect(new File(["x"], "cover.png", { type: "image/png" })); });
  act(() => view.result.current.clearImage());
  expect(view.result.current.imageFile).toBeNull();
  expect(view.result.current.imagePreview).toBeNull();
  expect(view.result.current.imageUri).toBeNull();
});
