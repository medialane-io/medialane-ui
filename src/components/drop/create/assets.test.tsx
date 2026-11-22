import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { EMPTY_DRAFT, newAsset, validateDropDraft, type DropDraft } from "../../../utils/drop/draft.js";
import { AssetsPanel } from "./assets-panel.js";

afterEach(() => cleanup());

const NOW = 1_800_000_000;
const png = (name: string) => new File(["x"], `${name}.png`, { type: "image/png" });

function Harness({ initial, onDraft }: { initial: DropDraft; onDraft?: (d: DropDraft) => void }) {
  const [draft, setDraftState] = useState(initial);
  const setDraft = (patch: Partial<DropDraft>) => setDraftState((d) => {
    const next = { ...d, ...patch };
    onDraft?.(next);
    return next;
  });
  return <AssetsPanel draft={draft} setDraft={setDraft} errors={validateDropDraft(draft, NOW)} open onToggle={() => {}} />;
}

const withAssets = (...assets: ReturnType<typeof newAsset>[]): DropDraft => ({
  ...EMPTY_DRAFT, collection: { ...EMPTY_DRAFT.collection, name: "Neon" }, assets,
});

test("adding images makes cards and counts tokens", () => {
  const view = render(<Harness initial={EMPTY_DRAFT} />);
  fireEvent.change(view.getByTestId("assets-input"), { target: { files: [png("a"), png("b")] } });
  expect(view.getAllByTestId("asset-card")).toHaveLength(2);
  expect(view.getByText("2 tokens from 2 assets")).toBeTruthy();
});

test("rejected files are listed with their reason", () => {
  const view = render(<Harness initial={EMPTY_DRAFT} />);
  fireEvent.change(view.getByTestId("assets-input"), { target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] } });
  expect(view.queryAllByTestId("asset-card")).toHaveLength(0);
  expect(view.getByText(/notes\.txt/)).toBeTruthy();
});

test("a card opens its editor; copies show as ×N on the card", () => {
  const view = render(<Harness initial={withAssets(newAsset(png("a")))} />);
  fireEvent.click(view.getAllByTestId("asset-card")[0]!);
  const dialog = view.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Copies"), { target: { value: "5" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
  expect(view.getByText("×5")).toBeTruthy();
  expect(view.getByText("5 tokens from 1 asset")).toBeTruthy();
});

test("the editor names an asset, adds a trait and replaces the image", () => {
  let last: DropDraft | null = null;
  const view = render(<Harness initial={withAssets(newAsset(png("a")))} onDraft={(d) => { last = d; }} />);
  fireEvent.click(view.getAllByTestId("asset-card")[0]!);
  const dialog = view.getByRole("dialog");
  expect(within(dialog).getByLabelText("Name").getAttribute("placeholder")).toBe("Neon #…");
  fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Wave" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Add trait" }));
  fireEvent.change(within(dialog).getByLabelText("Trait name 1"), { target: { value: "Mood" } });
  fireEvent.change(within(dialog).getByLabelText("Trait value 1"), { target: { value: "Calm" } });
  fireEvent.change(within(dialog).getByTestId("replace-input"), { target: { files: [png("b")] } });
  expect(last!.assets[0]).toMatchObject({ name: "Wave", traits: [{ key: "Mood", value: "Calm" }] });
  expect(last!.assets[0]!.file.name).toBe("b.png");
});

test("the editor moves between assets and removes one", () => {
  const view = render(<Harness initial={withAssets(newAsset(png("a")), newAsset(png("b")))} />);
  fireEvent.click(view.getAllByTestId("asset-card")[0]!);
  let dialog = view.getByRole("dialog");
  expect(within(dialog).getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(within(dialog).getByRole("button", { name: "Next" }));
  dialog = view.getByRole("dialog");
  expect(within(dialog).getByText("2 of 2")).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Remove asset" }));
  expect(view.getAllByTestId("asset-card")).toHaveLength(1);
});

test("select mode sets copies, adds a trait and removes for the selection", () => {
  let last: DropDraft | null = null;
  const view = render(<Harness initial={withAssets(newAsset(png("a")), newAsset(png("b")), newAsset(png("c")))} onDraft={(d) => { last = d; }} />);
  fireEvent.click(view.getByRole("button", { name: "Select" }));
  const cards = view.getAllByTestId("asset-card");
  fireEvent.click(cards[0]!);
  fireEvent.click(cards[1]!);
  fireEvent.change(view.getByLabelText("Copies for selected"), { target: { value: "3" } });
  fireEvent.click(view.getByRole("button", { name: "Set copies" }));
  expect(last!.assets.map((a) => a.copies)).toEqual(["3", "3", "1"]);
  fireEvent.change(view.getByLabelText("Trait name for selected"), { target: { value: "Mood" } });
  fireEvent.change(view.getByLabelText("Trait value for selected"), { target: { value: "Calm" } });
  fireEvent.click(view.getByRole("button", { name: "Add trait" }));
  expect(last!.assets.map((a) => a.traits.length)).toEqual([1, 1, 0]);
  fireEvent.click(view.getByRole("button", { name: "Remove" }));
  expect(view.getAllByTestId("asset-card")).toHaveLength(1);
});

test("select all picks every asset", () => {
  let last: DropDraft | null = null;
  const view = render(<Harness initial={withAssets(newAsset(png("a")), newAsset(png("b")))} onDraft={(d) => { last = d; }} />);
  fireEvent.click(view.getByRole("button", { name: "Select" }));
  fireEvent.click(view.getByRole("button", { name: "Select all" }));
  fireEvent.change(view.getByLabelText("Copies for selected"), { target: { value: "2" } });
  fireEvent.click(view.getByRole("button", { name: "Set copies" }));
  expect(last!.assets.map((a) => a.copies)).toEqual(["2", "2"]);
});

test("the mix switch shows only with more than one asset", () => {
  const one = render(<Harness initial={withAssets({ ...newAsset(png("a")), copies: "5" })} />);
  expect(one.queryByText("Mix the mint order")).toBeNull();
  cleanup();
  const two = render(<Harness initial={withAssets(newAsset(png("a")), newAsset(png("b")))} />);
  expect(two.getByText("Mix the mint order")).toBeTruthy();
  expect(two.getByRole("switch").getAttribute("aria-checked")).toBe("true");
});

test("over 2,000 tokens flags the totals line", () => {
  const view = render(<Harness initial={withAssets({ ...newAsset(png("a")), copies: "2001" })} />);
  expect(view.getByText("2,001 tokens from 1 asset").className).toContain("text-destructive");
});

test("media of any kind becomes an asset; non-image media shows its kind until a feature image is added", () => {
  let last: DropDraft | null = null;
  const view = render(<Harness initial={EMPTY_DRAFT} onDraft={(d) => { last = d; }} />);
  expect(view.getByText("Add media")).toBeTruthy();
  fireEvent.change(view.getByTestId("assets-input"), { target: { files: [new File(["x"], "wave.mp4", { type: "video/mp4" })] } });
  const card = view.getAllByTestId("asset-card")[0]!;
  expect(within(card).getByText("Video")).toBeTruthy();
  expect(card.querySelector("img")).toBeNull();
  fireEvent.click(card);
  const dialog = view.getByRole("dialog");
  expect(within(dialog).getByText("Feature image *")).toBeTruthy();
  fireEvent.change(within(dialog).getByTestId("feature-input"), { target: { files: [png("art")] } });
  expect(last!.assets[0]!.feature?.name).toBe("art.png");
  fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
  expect(view.getAllByTestId("asset-card")[0]!.querySelector("img")).toBeTruthy();
});

test("image assets have no feature image field", () => {
  const view = render(<Harness initial={withAssets(newAsset(png("a")))} />);
  fireEvent.click(view.getAllByTestId("asset-card")[0]!);
  expect(within(view.getByRole("dialog")).queryByText("Feature image *")).toBeNull();
});
