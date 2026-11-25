import { expect, test, afterEach } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useNewCollectionDraft } from "./use-new-collection-draft.js";

afterEach(() => cleanup());

test("the new collection follows the asset until the person edits it", () => {
  const { result, rerender } = renderHook(({ n, d }) => useNewCollectionDraft(n, d), { initialProps: { n: "Sunset", d: "A photo" } });
  expect(result.current.name).toBe("Sunset");
  expect(result.current.description).toBe("A photo");
  expect(result.current.symbol.length).toBeGreaterThan(0);

  rerender({ n: "Sunrise", d: "A photo at dawn" });
  expect(result.current.name).toBe("Sunrise");
  expect(result.current.description).toBe("A photo at dawn");

  act(() => result.current.setName("My Series"));
  rerender({ n: "Moonrise", d: "A photo at night" });
  expect(result.current.name).toBe("My Series");
});

test("reset empties the draft", () => {
  const { result } = renderHook(() => useNewCollectionDraft("", ""));
  act(() => result.current.setName("Mine"));
  act(() => result.current.reset());
  expect(result.current.name).toBe("");
});
