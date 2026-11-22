import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { EMPTY_DRAFT, newAsset, validateDropDraft, type DropDraft } from "../../../utils/drop/draft.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { CollectionPanel } from "./collection-panel.js";
import { SettingsPanel } from "./settings-panel.js";
import { MedialaneAppProvider, type MedialaneApp } from "../../medialane-app.js";

afterEach(() => cleanup());

const NOW = 1_800_000_000;
const png = (name: string) => new File(["x"], `${name}.png`, { type: "image/png" });
const named = (patch: Partial<DropDraft> = {}): DropDraft => ({
  ...EMPTY_DRAFT,
  collection: { ...EMPTY_DRAFT.collection, name: "Himalaya Records" },
  ...patch,
});
const noErrors = validateDropDraft(named({ assets: [newAsset(png("a"))] }), NOW);

test("a closed panel shows its summary; opening shows the fields", () => {
  const props = { draft: named(), setDraft: () => {}, errors: noErrors, onToggle: () => {} };
  const closed = render(<CollectionPanel {...props} open={false} />);
  expect(closed.getByText("Himalaya Records")).toBeTruthy();
  expect(closed.queryByText("Name *")).toBeNull();
  expect(closed.getByRole("button", { name: /Collection/ }).getAttribute("aria-expanded")).toBe("false");
  cleanup();
  const open = render(<CollectionPanel {...props} open />);
  for (const label of ["Name *", "Description", "External link"]) expect(open.getByText(label)).toBeTruthy();
  expect(open.getByRole("button", { name: /Collection/ }).getAttribute("aria-expanded")).toBe("true");
});

test("the header toggles the panel", () => {
  const onToggle = mock(() => {});
  const view = render(<CollectionPanel draft={named()} setDraft={() => {}} errors={noErrors} open={false} onToggle={onToggle} />);
  fireEvent.click(view.getByRole("button", { name: /Collection/ }));
  expect(onToggle).toHaveBeenCalledTimes(1);
});

test("typing the name updates the collection", () => {
  const setDraft = mock((_: Partial<DropDraft>) => {});
  const view = render(<CollectionPanel draft={named()} setDraft={setDraft} errors={noErrors} open onToggle={() => {}} />);
  fireEvent.change(view.getByLabelText("Name *"), { target: { value: "Moon" } });
  expect(setDraft.mock.calls[0]![0].collection?.name).toBe("Moon");
});

test("the cover defaults to the first asset and can be reset after choosing one", () => {
  const asset = newAsset(png("first"));
  const setDraft = mock((_: Partial<DropDraft>) => {});
  const view = render(<CollectionPanel draft={named({ assets: [asset] })} setDraft={setDraft} errors={noErrors} open onToggle={() => {}} />);
  expect(view.getByAltText("Cover").getAttribute("src")).toBe(previewUrl(asset.file));
  expect(view.queryByRole("button", { name: "Use first asset" })).toBeNull();
  const cover = png("cover");
  fireEvent.change(view.getByTestId("cover-input"), { target: { files: [cover] } });
  expect(setDraft.mock.calls[0]![0].collection?.cover).toBe(cover);
  cleanup();
  const chosen = render(<CollectionPanel draft={named({ assets: [asset], collection: { ...named().collection, cover } })} setDraft={setDraft} errors={noErrors} open onToggle={() => {}} />);
  expect(chosen.getByAltText("Cover").getAttribute("src")).toBe(previewUrl(cover));
  fireEvent.click(chosen.getByRole("button", { name: "Use first asset" }));
  expect(setDraft.mock.calls[1]![0].collection?.cover).toBeNull();
});

test("an error replaces the summary", () => {
  const errors = validateDropDraft(EMPTY_DRAFT, NOW);
  const view = render(<CollectionPanel draft={EMPTY_DRAFT} setDraft={() => {}} errors={errors} open={false} onToggle={() => {}} />);
  const message = view.getByText("Name the collection");
  expect(message.className).toContain("text-destructive");
});

const app: MedialaneApp = {
  getClient: () => ({ api: { drops: { fee: async () => ({ launchpadBps: 0 }) } } }) as never,
  getSigner: () => { throw new Error("not used"); },
  walletAddress: null,
  onRequireWallet: () => {},
};
const settings = (draft: DropDraft, open: boolean) =>
  render(
    <MedialaneAppProvider value={app}>
      <SettingsPanel draft={draft} setDraft={() => {}} errors={validateDropDraft(draft, NOW)} open={open} onToggle={() => {}} />
    </MedialaneAppProvider>,
  );

test("settings summary shows price and start, plus the wallet list", () => {
  const free = settings(named({ assets: [newAsset(png("a"))] }), false);
  expect(free.getByText("Free")).toBeTruthy();
  expect(free.getByText("Starts at launch")).toBeTruthy();
  expect(free.queryByText("Wallet list")).toBeNull();
  cleanup();
  const listed = settings(named({ assets: [newAsset(png("a"))], listOnly: true, allowlist: "0x1" }), false);
  expect(listed.getByText("Wallet list")).toBeTruthy();
});

test("settings open with every term", () => {
  const view = settings(named({ assets: [newAsset(png("a"))] }), true);
  for (const label of ["Price", "Starts", "Ends", "Limit per wallet", "Who can mint", "License terms", "Exclusive content"]) {
    expect(view.getAllByText(label).length).toBeGreaterThan(0);
  }
});

test("a past start time shows its error in the summary", () => {
  const draft = named({ assets: [newAsset(png("a"))], sale: { ...EMPTY_DRAFT.sale, startNow: false, start: "2020-01-01T10:00" } });
  const view = settings(draft, false);
  expect(view.getByText("Pick a start time in the future").className).toContain("text-destructive");
});

test("errors read in Portuguese", async () => {
  const { I18nProvider } = await import("../../../i18n/provider.js");
  const { loadCatalog } = await import("../../../i18n/catalogs.js");
  const messages = await loadCatalog("pt");
  const draft = named({ collection: { ...EMPTY_DRAFT.collection, name: "", externalUrl: "http://x" } });
  const view = render(
    <I18nProvider locale="pt" messages={messages}>
      <CollectionPanel draft={draft} setDraft={() => {}} errors={validateDropDraft(draft, NOW)} open onToggle={() => {}} />
    </I18nProvider>,
  );
  expect(view.getAllByText("Dê um nome à coleção").length).toBeGreaterThan(0);
  expect(view.getByText("Adicione um link que comece com https://")).toBeTruthy();
});
