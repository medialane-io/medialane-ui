import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { FastMint } = await import("./fast-mint.js");
const { MedialaneAppProvider } = await import("../medialane-app.js");

afterEach(() => cleanup());

const props = {
  collections: [],
  refetchCollections: async () => [],
  hasWallet: true,
  walletAddress: "0xabc",
  onRequireWallet: () => {},
  getUploadToken: async () => "token",
  getSigner: () => { throw new Error("unused"); },
  client: {} as MedialaneClient,
};
const app = { getClient: () => props.client, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xabc", onRequireWallet: () => {} };

test("with no file chosen it shows the dropzone, inline", () => {
  const view = render(<MedialaneAppProvider value={app}><FastMint {...props} /></MedialaneAppProvider>);
  expect(view.container.querySelector("input[type=file]")).toBeTruthy();
  expect(view.queryByRole("dialog")).toBeNull();
});

test("as a dialog it opens with a title and closes with the close button", () => {
  let closed = 0;
  const view = render(<MedialaneAppProvider value={app}><FastMint {...props} presentation="dialog" open onClose={() => { closed++; }} /></MedialaneAppProvider>);
  expect(view.getByRole("dialog")).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: "Close" }));
  expect(closed).toBe(1);
});

const fileInput = (view: ReturnType<typeof render>) => view.container.querySelector("input[type=file]") as HTMLInputElement;

test("a file that cannot be used is explained on the dropzone", async () => {
  const view = render(<MedialaneAppProvider value={app}><FastMint {...props} /></MedialaneAppProvider>);
  fireEvent.change(fileInput(view), { target: { files: [new File(["x"], "tool.exe", { type: "application/x-msdownload" })] } });
  await waitFor(() => expect(view.getByRole("alert").textContent).toBe("Use a supported media file."));
  expect(view.getByRole("button", { name: "Upload media" })).toBeTruthy();
});

test("a failed media upload shows its reason with a retry", async () => {
  (globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
  (globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};
  let attempts = 0;
  const client = { api: { metadata: { signedUrl: async () => { attempts += 1; throw new Error("Storage limit reached"); } } } } as unknown as MedialaneClient;
  const view = render(<MedialaneAppProvider value={app}><FastMint {...props} client={client} /></MedialaneAppProvider>);
  fireEvent.change(fileInput(view), { target: { files: [new File(["x"], "poster.png", { type: "image/png" })] } });
  await waitFor(() => expect(view.getByRole("alert").textContent).toBe("Upload failed: Storage limit reached"));
  fireEvent.click(view.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(attempts).toBe(2));
});
