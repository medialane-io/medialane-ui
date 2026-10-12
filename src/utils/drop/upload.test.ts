import { expect, test } from "bun:test";
import { uploadAll, type UploadTask } from "./upload.js";

const file = (name: string) => new File(["x"], name);
const task = (id: string, over: Partial<UploadTask> = {}): UploadTask => ({ id, file: file(id), status: "pending", uri: null, error: null, ...over });

test("uploads every unfinished file, keeps finished ones, and reports failures without throwing", async () => {
  const calls: string[] = [];
  const upload = async (f: File) => {
    calls.push(f.name);
    if (f.name === "b") throw new Error("network down");
    return `ipfs://${f.name}`;
  };
  const snapshots: UploadTask[][] = [];
  const out = await uploadAll([task("a"), task("b"), task("c", { status: "done", uri: "ipfs://c" })], upload, (t) => snapshots.push(t), 2);
  expect(calls.sort()).toEqual(["a", "b"]);
  expect(out.map((t) => [t.id, t.status, t.uri])).toEqual([["a", "done", "ipfs://a"], ["b", "failed", null], ["c", "done", "ipfs://c"]]);
  expect(out[1]!.error).toBe("network down");
  expect(snapshots.length).toBeGreaterThan(0);
});

test("a retry uploads only the failed files", async () => {
  const calls: string[] = [];
  const out = await uploadAll([task("a", { status: "done", uri: "ipfs://a" }), task("b", { status: "failed", error: "x" })],
    async (f) => { calls.push(f.name); return `ipfs://${f.name}`; }, () => {});
  expect(calls).toEqual(["b"]);
  expect(out.every((t) => t.status === "done")).toBe(true);
});
