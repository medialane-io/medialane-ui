import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneApp } from "../../medialane-app.js";

mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {}, back: () => {} }) }));

const { DropCreate, dropSymbol } = await import("./drop-create.js");
const { MedialaneAppProvider } = await import("../../medialane-app.js");
const { EMPTY_DRAFT } = await import("../../../utils/drop/draft.js");
const { memoryDraftStore } = await import("../../../utils/drop/draft-store.js");

afterEach(() => cleanup());

const app: MedialaneApp = {
  getClient: () => ({ api: { drops: { fee: async () => ({ launchpadBps: 0 }) } } }) as never,
  getSigner: () => { throw new Error("not used"); },
  walletAddress: "0x0123456789abcdef",
  onRequireWallet: () => {},
};

const show = async (value: MedialaneApp = app, store = memoryDraftStore()) => {
  const view = render(<MedialaneAppProvider value={value}><DropCreate store={store} /></MedialaneAppProvider>);
  await waitFor(() => expect(view.getByText("Collection")).toBeTruthy());
  return view;
};

test("the page shows the header and three panels, Collection open first", async () => {
  const view = await show();
  expect(view.getByText("Collection drop")).toBeTruthy();
  expect(view.getByText("A new collection for people to collect.")).toBeTruthy();
  for (const title of ["Collection", "Works", "Drop settings"]) expect(view.getByText(title)).toBeTruthy();
  expect(view.getByLabelText("Name")).toBeTruthy();
});

test("opening one panel closes the other", async () => {
  const view = await show();
  fireEvent.click(view.getByRole("button", { name: /^Works/ }));
  expect(view.getByTestId("assets-input")).toBeTruthy();
  expect(view.queryByLabelText("Name")).toBeNull();
});

test("an empty draft asks for the collection name first", async () => {
  const view = await show();
  expect(view.getByRole("button", { name: "Name the collection" })).toBeTruthy();
});

test("the launch button names what is missing and opens that panel", async () => {
  const view = await show();
  fireEvent.change(view.getByLabelText("Name"), { target: { value: "Neon" } });
  fireEvent.click(view.getByRole("button", { name: /^Drop settings/ }));
  fireEvent.click(view.getByRole("button", { name: "Add a work" }));
  expect(view.getByTestId("assets-input")).toBeTruthy();
});

test("signed out, launching asks to sign in", async () => {
  let asked = 0;
  const view = await show({ ...app, walletAddress: null, onRequireWallet: () => { asked++; } });
  fireEvent.click(view.getByRole("button", { name: "Sign in to launch" }));
  expect(asked).toBe(1);
});

test("a restored draft offers to start over", async () => {
  const store = memoryDraftStore();
  await store.save({ ...EMPTY_DRAFT, collection: { ...EMPTY_DRAFT.collection, name: "Neon" } });
  const view = await show(app, store);
  await waitFor(() => expect(view.getByText("Draft restored")).toBeTruthy());
  expect((view.getByLabelText("Name") as HTMLInputElement).value).toBe("Neon");
  fireEvent.click(view.getByRole("button", { name: "Start over" }));
  expect((view.getByLabelText("Name") as HTMLInputElement).value).toBe("");
  expect(view.queryByText("Draft restored")).toBeNull();
});

test("the fixed-at-launch line sits above the button", async () => {
  const view = await show();
  expect(view.getByText("Fixed at launch: works, price, dates, quantity and the wallet limit.")).toBeTruthy();
});

test("the symbol comes from the name, with a fallback when the name has no letters to use", () => {
  expect(dropSymbol("Himalayas Records")).toMatch(/^[A-Z0-9]{1,10}$/);
  expect(dropSymbol("")).toBe("DROP");
  expect(dropSymbol("🎵🎵")).toBe("DROP");
});
