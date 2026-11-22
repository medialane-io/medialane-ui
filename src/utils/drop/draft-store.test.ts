import { afterEach, expect, test } from "bun:test";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { EMPTY_DRAFT, newAsset, type DropDraft } from "./draft.js";
import { indexedDbDraftStore, memoryDraftStore, useSavedDraft } from "./draft-store.js";

afterEach(() => cleanup());

const png = (name: string) => new File(["x"], `${name}.png`, { type: "image/png" });
const named: DropDraft = {
  ...EMPTY_DRAFT,
  collection: { ...EMPTY_DRAFT.collection, name: "Neon Tides" },
  assets: [{ ...newAsset(png("a")), name: "Wave" }],
};

test("a saved draft comes back with its files", async () => {
  const store = memoryDraftStore();
  await store.save(named);
  const back = await store.load();
  expect(back?.assets[0]?.name).toBe("Wave");
  expect(back?.assets[0]?.file.name).toBe("a.png");
  await store.clear();
  expect(await store.load()).toBeNull();
});

test("the hook restores a saved draft", async () => {
  const store = memoryDraftStore();
  await store.save(named);
  const { result } = renderHook(() => useSavedDraft(store));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.restored).toBe(true);
  expect(result.current.draft.collection.name).toBe("Neon Tides");
});

test("an empty saved draft does not count as restored", async () => {
  const store = memoryDraftStore();
  await store.save(EMPTY_DRAFT);
  const { result } = renderHook(() => useSavedDraft(store));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.restored).toBe(false);
});

test("the hook saves after changes and starts over", async () => {
  const store = memoryDraftStore();
  const { result } = renderHook(() => useSavedDraft(store));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.setDraft({ mixOrder: false }));
  act(() => result.current.setDraft((d) => ({ collection: { ...d.collection, name: "Moon" } })));
  await waitFor(async () => expect((await store.load())?.collection.name).toBe("Moon"), { timeout: 1500 });
  expect((await store.load())?.mixOrder).toBe(false);
  act(() => result.current.startOver());
  expect(result.current.draft).toEqual(EMPTY_DRAFT);
  expect(result.current.restored).toBe(false);
  await waitFor(async () => expect(await store.load()).toBeNull());
});

test("no IndexedDB means no restore and no crash", async () => {
  expect(typeof globalThis.indexedDB).toBe("undefined");
  const store = indexedDbDraftStore();
  expect(await store.load()).toBeNull();
  await store.save(named);
  await store.clear();
});
