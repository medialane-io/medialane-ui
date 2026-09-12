import { test, expect } from "bun:test";
import { ipfsToHttp, DEFAULT_GATEWAY, PUBLIC_GATEWAY, gatewayFrom } from "./ipfs.js";

test("resolves ipfs:// URIs to the public gateway with a default resize", () => {
  expect(ipfsToHttp("ipfs://QmXxx")).toBe(`${DEFAULT_GATEWAY}QmXxx?img-width=1200&img-format=webp&img-quality=80`);
});

test("resolves a known gateway host URL to the public gateway with a default resize", () => {
  expect(ipfsToHttp("https://ipfs.io/ipfs/QmXxx")).toBe(`${DEFAULT_GATEWAY}QmXxx?img-width=1200&img-format=webp&img-quality=80`);
});

test("an input that's already the canonical public gateway URL still resolves through the gateway prefix", () => {
  const url = `${DEFAULT_GATEWAY}QmXxx`;
  expect(ipfsToHttp(url).startsWith(url)).toBe(true);
});

test("a custom width overrides the default", () => {
  expect(ipfsToHttp("ipfs://QmXxx", { width: 400 })).toBe(`${DEFAULT_GATEWAY}QmXxx?img-width=400&img-format=webp&img-quality=80`);
});

test("width: null opts out of resizing entirely", () => {
  expect(ipfsToHttp("ipfs://QmXxx", { width: null })).toBe(`${DEFAULT_GATEWAY}QmXxx`);
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

test("with no gateway configured, the public one is used", () => {
  expect(DEFAULT_GATEWAY).toBe(PUBLIC_GATEWAY);
});

test("a configured gateway is normalised whether or not it carries a scheme", () => {
  expect(gatewayFrom("example.mypinata.cloud")).toBe("https://example.mypinata.cloud/ipfs/");
  expect(gatewayFrom("https://example.mypinata.cloud")).toBe("https://example.mypinata.cloud/ipfs/");
  expect(gatewayFrom("https://example.mypinata.cloud/")).toBe("https://example.mypinata.cloud/ipfs/");
  expect(gatewayFrom("")).toBe(PUBLIC_GATEWAY);
  expect(gatewayFrom(undefined)).toBe(PUBLIC_GATEWAY);
});

test("a url outside the configured gateway is never given a token", () => {
  expect(ipfsToHttp("https://example.com/a.png")).toBe("https://example.com/a.png");
});
