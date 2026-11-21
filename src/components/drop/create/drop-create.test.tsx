import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneApp } from "../../medialane-app.js";

mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {}, back: () => {} }) }));

const { DropCreate, withArtwork, withoutArtwork, dropSymbol } = await import("./drop-create.js");
const { MedialaneAppProvider } = await import("../../medialane-app.js");
const { EMPTY_DRAFT } = await import("../../../utils/drop/draft.js");

afterEach(() => cleanup());

const app: MedialaneApp = {
  getClient: () => ({ api: {} }) as never,
  getSigner: () => { throw new Error("not used"); },
  walletAddress: null,
  onRequireWallet: () => {},
};

const image = (name: string) => new File(["x"], name, { type: "image/png" });
const show = (value: MedialaneApp = app) => render(<MedialaneAppProvider value={value}><DropCreate /></MedialaneAppProvider>);
const addImages = (view: ReturnType<typeof show>, files: File[]) =>
  fireEvent.change(view.getByTestId("artwork-input"), { target: { files } });

test("the page is the drop itself: artwork, name, description, terms and the launch button", () => {
  const view = show();
  expect(view.getByText("Create a collection drop")).toBeTruthy();
  expect(view.getByText(/Collectors mint straight from your drop page/)).toBeTruthy();
  expect(view.getByText("Add artwork")).toBeTruthy();
  expect(view.getByPlaceholderText("Name your drop")).toBeTruthy();
  expect(view.getByPlaceholderText("Tell collectors about this drop")).toBeTruthy();
  for (const text of ["Price", "Copies", "Timing", "Who can mint", "License", "Exclusive content", "Starts at launch", "Everyone", "Off"]) {
    expect(view.getAllByText(text).length).toBeGreaterThan(0);
  }
  expect(view.getByText("Artwork, price and copies can't change after launch.")).toBeTruthy();
  expect(view.queryByText("Symbol")).toBeNull();
});

test("one image shows large with a strip to add more; a second image makes it a set of pieces", async () => {
  const view = show();
  addImages(view, [image("a.png")]);
  await waitFor(() => expect(view.getByRole("button", { name: "Add images" })).toBeTruthy());
  expect(view.getByLabelText("Copies")).toBeTruthy();

  addImages(view, [image("b.png")]);
  await waitFor(() => expect(view.getByText("Pieces")).toBeTruthy());
  expect(view.getByText("2")).toBeTruthy();
  expect(view.queryByLabelText("Copies")).toBeNull();
});

test("a setting opens its controls in place, one at a time", () => {
  const view = show();
  fireEvent.click(view.getByRole("button", { name: /Timing/ }));
  expect(view.getByText("Starts now")).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: /Who can mint/ }));
  expect(view.queryByText("Starts now")).toBeNull();
  expect(view.getByText("Invited wallets")).toBeTruthy();
});

test("images in and out: one is an edition, more a collection, back to one an edition", () => {
  const one = { ...EMPTY_DRAFT, ...withArtwork(EMPTY_DRAFT, [image("a.png")]) };
  expect(one.kind).toBe("edition");

  const three = { ...one, ...withArtwork(one, [image("b.png"), image("c.png")]) };
  expect(three.kind).toBe("collection");
  expect(three.items.map((i) => i.file.name)).toEqual(["a.png", "b.png", "c.png"]);

  const cover = three.items[2]!.file;
  const withCover = { ...three, cover };
  const two = { ...withCover, ...withoutArtwork(withCover, cover) };
  expect(two.items.map((i) => i.file.name)).toEqual(["a.png", "b.png"]);
  expect(two.cover).toBeNull();

  const back = { ...two, ...withoutArtwork(two, two.items[1]!.file) };
  expect(back.kind).toBe("edition");
  expect(back.edition?.name).toBe("a.png");
});

test("the symbol comes from the name, with a fallback when the name has no letters to use", () => {
  expect(dropSymbol("Himalayas Records")).toMatch(/^[A-Z0-9]{1,10}$/);
  expect(dropSymbol("")).toBe("DROP");
  expect(dropSymbol("🎵🎵")).toBe("DROP");
});

test("signed out, launching asks to sign in", () => {
  let asked = 0;
  const view = show({ ...app, onRequireWallet: () => { asked++; } });
  fireEvent.click(view.getByRole("button", { name: "Sign in to launch" }));
  expect(asked).toBe(1);
});
