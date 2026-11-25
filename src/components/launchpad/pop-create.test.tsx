import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { PopCreate } = await import("./pop-create.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";

function setup(metadata: Record<string, unknown> = {}) {
  const intents: Record<string, unknown>[] = [];
  const uploads: Record<string, unknown>[] = [];
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
      metadata: { upload: async (m: Record<string, unknown>) => { uploads.push(m); return { data: { url: "ipfs://pop" } }; }, ...metadata },
      intents: {
        create: async (_kind: string, params: Record<string, unknown>) => { intents.push(params); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: ME, execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    walletAddress: ME,
    onRequireWallet: () => {},
  } as MedialaneApp;
  const view = render(
    <MedialaneAppProvider value={app}>
      <PopCreate />
    </MedialaneAppProvider>,
  );
  return { view, intents, uploads };
}

test("an event is created as a pop collection with its claim deadline", async () => {
  const { view, intents, uploads } = setup();
  fireEvent.change(view.getByPlaceholderText("Starknet Hackathon 2026"), { target: { value: "Rio Summit" } });
  await waitFor(() => expect((view.getByPlaceholderText("SKHACK") as HTMLInputElement).value).not.toBe(""));
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Back to POP launchpad")).toBeTruthy());
  expect(intents[0]).toMatchObject({ owner: ME, name: "Rio Summit", baseUri: "ipfs://pop", service: "pop-protocol" });
  expect(typeof intents[0]!.claimEndTimestamp).toBe("number");
  expect(uploads[0]!.attributes).toEqual([{ trait_type: "Visibility", value: "Private" }, { trait_type: "Event Type", value: "Conference" }]);
  expect(view.getByText("Back to POP launchpad").closest("a")?.getAttribute("href")).toBe("/launchpad/pop");
});

test("an event without a name is not created", async () => {
  const { view, intents } = setup();
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.getByText("Name required")).toBeTruthy());
  expect(intents).toEqual([]);
});

function failingUploads() {
  (globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
  (globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};
  return { signedUrl: async () => { throw new Error("Storage limit reached"); } };
}

const pickImage = (view: { container: HTMLElement }) =>
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });

test("an event is not created without the picture that failed to upload", async () => {
  const { view, intents, uploads } = setup(failingUploads());
  pickImage(view);
  await waitFor(() => expect(view.getByRole("alert").textContent).toBe("Image upload failed: Storage limit reached"));
  fireEvent.change(view.getByPlaceholderText("Starknet Hackathon 2026"), { target: { value: "Rio Summit" } });
  await waitFor(() => expect((view.getByPlaceholderText("SKHACK") as HTMLInputElement).value).not.toBe(""));
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(document.activeElement?.getAttribute("data-status")).toBe("failed"));
  expect(uploads).toEqual([]);
  expect(intents).toEqual([]);
});
