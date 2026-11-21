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
const show = (value: MedialaneApp = app, aside?: React.ReactNode) =>
  render(<MedialaneAppProvider value={value}><DropCreate aside={aside} /></MedialaneAppProvider>);

test("the page follows the launchpad layout: header, every field, and the app's aside beside the preview", () => {
  const view = show(app, <p>Drop features</p>);
  expect(view.getByText("Collection drop")).toBeTruthy();
  expect(view.getByText(/Collectors mint straight from your drop page/)).toBeTruthy();
  for (const text of ["Artwork *", "Name *", "Description", "Price", "Copies", "Who can mint", "Timing", "License terms", "Exclusive content"]) {
    expect(view.getAllByText(text).length).toBeGreaterThan(0);
  }
  expect(view.getByText("Drop features")).toBeTruthy();
  expect(view.queryByText("Symbol")).toBeNull();
});

test("one image keeps copies; a second image makes a set of unique pieces without copies", async () => {
  const view = show();
  fireEvent.change(view.getByTestId("artwork-input"), { target: { files: [image("a.png")] } });
  await waitFor(() => expect(view.getByText("Add more images to make a set of unique pieces.")).toBeTruthy());
  expect(view.getByLabelText("Copies")).toBeTruthy();

  fireEvent.change(view.getByTestId("artwork-input"), { target: { files: [image("b.png")] } });
  await waitFor(() => expect(view.getByText("2 unique pieces")).toBeTruthy());
  expect(view.queryByLabelText("Copies")).toBeNull();
});

test("images in and out: one is an edition, more a collection, back to one an edition", () => {
  const one = { ...EMPTY_DRAFT, ...withArtwork(EMPTY_DRAFT, [image("a.png")]) };
  expect(one.kind).toBe("edition");
  const three = { ...one, ...withArtwork(one, [image("b.png"), image("c.png")]) };
  expect(three.kind).toBe("collection");
  expect(three.items.map((i) => i.file.name)).toEqual(["a.png", "b.png", "c.png"]);
  const two = { ...three, ...withoutArtwork(three, three.items[2]!.file) };
  expect(two.items.map((i) => i.file.name)).toEqual(["a.png", "b.png"]);
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
