import { test, expect } from "bun:test";
import { ipfsToHttp, DEFAULT_GATEWAY } from "./ipfs.js";

test("resolves ipfs:// URIs to the public gateway", () => {
  expect(ipfsToHttp("ipfs://QmXxx")).toBe(`${DEFAULT_GATEWAY}QmXxx`);
});

test("resolves a known gateway host URL to the public gateway", () => {
  expect(ipfsToHttp("https://ipfs.io/ipfs/QmXxx")).toBe(`${DEFAULT_GATEWAY}QmXxx`);
});

test("an input that's already the canonical public gateway URL resolves to itself", () => {
  const url = `${DEFAULT_GATEWAY}QmXxx`;
  expect(ipfsToHttp(url)).toBe(url);
});

test("passes data:image/* URIs through unchanged", () => {
  const dataUri = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
  expect(ipfsToHttp(dataUri)).toBe(dataUri);
});

test("returns the URI unchanged for an unrecognized host", () => {
  expect(ipfsToHttp("https://example.com/some-image.png")).toBe("https://example.com/some-image.png");
});

test("rejects javascript: URIs", () => {
  expect(ipfsToHttp("javascript:alert(1)")).toBe("");
});

test("returns empty string for null/undefined", () => {
  expect(ipfsToHttp(null)).toBe("");
  expect(ipfsToHttp(undefined)).toBe("");
});
