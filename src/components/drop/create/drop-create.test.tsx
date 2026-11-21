import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneApp } from "../../medialane-app.js";

mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/", useRouter: () => ({ push: () => {}, back: () => {} }) }));

const { DropCreate, withArtwork, dropSymbol } = await import("./drop-create.js");
const { MedialaneAppProvider } = await import("../../medialane-app.js");
const { EMPTY_DRAFT } = await import("../../../utils/drop/draft.js");

afterEach(() => cleanup());

const app: MedialaneApp = {
  getClient: () => ({ api: {} }) as never,
  getSigner: () => { throw new Error("not used"); },
  walletAddress: "0x1234567890",
  onRequireWallet: () => {},
};

const image = (name: string) => new File(["x"], name, { type: "image/png" });
const show = (value: MedialaneApp = app) => render(<MedialaneAppProvider value={value}><DropCreate /></MedialaneAppProvider>);

test("the page opens on the artwork, with nothing else to fill in yet", () => {
  const view = show();
  expect(view.getByText("Create a drop")).toBeTruthy();
  expect(view.getByText("Drop or upload your artwork")).toBeTruthy();
  expect(view.queryByText("Launch drop")).toBeNull();
  expect(view.queryByLabelText("Name")).toBeNull();
});

test("one image is an edition; the form, its panels and the launch button appear", async () => {
  const view = show();
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [image("art.png")] } });
  await waitFor(() => expect(view.getByLabelText("Copies")).toBeTruthy());
  for (const text of ["Name", "Description", "Price", "Who can mint", "Timing and limits", "License terms", "Exclusive content", "Launch drop", "100 copies"]) {
    expect(view.getAllByText(text).length).toBeGreaterThan(0);
  }
  expect(view.getByText("Starts at launch · No end date · No limit per wallet")).toBeTruthy();
  expect(view.queryByText("Symbol")).toBeNull();
});

test("one image is an edition, more images make a collection that keeps the first", () => {
  const one = { ...EMPTY_DRAFT, ...withArtwork(EMPTY_DRAFT, [image("a.png")]) };
  expect(one.kind).toBe("edition");
  expect(one.edition?.name).toBe("a.png");

  const more = { ...one, ...withArtwork(one, [image("b.png"), image("c.png")]) };
  expect(more.kind).toBe("collection");
  expect(more.edition).toBeNull();
  expect(more.items.map((i) => i.file.name)).toEqual(["a.png", "b.png", "c.png"]);

  expect(withArtwork(EMPTY_DRAFT, [image("a.png"), image("b.png")]).kind).toBe("collection");
});

test("the symbol comes from the name, with a fallback when the name has no letters to use", () => {
  expect(dropSymbol("Himalayas Records")).toMatch(/^[A-Z0-9]{1,10}$/);
  expect(dropSymbol("")).toBe("DROP");
  expect(dropSymbol("🎵🎵")).toBe("DROP");
});

test("signed out, picking the artwork asks to sign in", () => {
  let asked = 0;
  const view = show({ ...app, walletAddress: null, onRequireWallet: () => { asked++; } });
  fireEvent.click(view.getByRole("button", { name: /to upload media/ }));
  expect(asked).toBe(1);
});
