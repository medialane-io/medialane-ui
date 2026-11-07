import { expect, test, afterEach } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useNewCollectionDraft } from "./use-new-collection-draft.js";
import { useIpfsUpload } from "./use-ipfs-upload.js";

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

test("an upload shows a preview, then the uploaded address, and clear removes both", async () => {
  const created: string[] = [];
  const revoked: string[] = [];
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  URL.createObjectURL = () => { const u = `blob:${created.length}`; created.push(u); return u; };
  URL.revokeObjectURL = (u: string) => { revoked.push(u); };
  try {
    const { result } = renderHook(() => useIpfsUpload());
    await act(async () => { await result.current.start(new File(["x"], "a.png"), async () => "ipfs://a", () => {}); });
    expect(result.current.preview).toBe("blob:0");
    expect(result.current.uri).toBe("ipfs://a");

    await act(async () => { await result.current.start(new File(["y"], "b.png"), async () => { throw new Error("nope"); }, (m) => { errors.push(m); }); });
    expect(revoked).toEqual(["blob:0"]);
    expect(result.current.uri).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(errors.length).toBe(1);

    act(() => result.current.clear());
    expect(result.current.preview).toBeNull();
    expect(revoked).toEqual(["blob:0", "blob:1"]);
  } finally {
    URL.createObjectURL = original.create;
    URL.revokeObjectURL = original.revoke;
  }
});

const errors: string[] = [];
