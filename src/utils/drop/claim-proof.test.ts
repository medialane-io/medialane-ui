import { expect, test } from "bun:test";
import { claimProofFor } from "./claim-proof.js";

function memory() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

test("a link's proof is remembered per collection and prefix, and survives a visit without the fragment", () => {
  const s = memory();
  expect(claimProofFor(s, "0xd409", "#pop-proof=0x1,0x2", "drop-proof")).toEqual(["0x1", "0x2"]);
  expect(claimProofFor(s, "0xd409", "", "drop-proof")).toEqual(["0x1", "0x2"]);
  expect(claimProofFor(s, "0xd409", "", "pop-proof")).toBeNull();
  expect([...s.m.keys()][0]!.startsWith("drop-proof:0x0")).toBe(true);
});

test("no storage still returns the link's proof", () => {
  expect(claimProofFor(null, "0xd409", "#pop-proof=", "drop-proof")).toEqual([]);
});
