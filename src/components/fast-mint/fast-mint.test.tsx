import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
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
