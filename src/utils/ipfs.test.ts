import { describe, test, expect } from "bun:test";
import { ipfsToHttp, DEFAULT_GATEWAY, toDisplayUrl, createImageResolver } from "./ipfs.js";

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

test("a url outside the configured gateway is never given a token", () => {
  expect(ipfsToHttp("https://example.com/a.png")).toBe("https://example.com/a.png");
});

test("no gateway url ever carries a token", () => {
  const urls = [
    ipfsToHttp("ipfs://QmXxx"),
    ipfsToHttp("ipfs://QmXxx", { width: 400 }),
    ipfsToHttp("https://gateway.pinata.cloud/ipfs/QmXxx"),
    toDisplayUrl("ipfs://QmXxx"),
  ];
  for (const url of urls) {
    expect(url.toLowerCase()).not.toContain("token");
  }
});

describe("createImageResolver", () => {
  const resolve = createImageResolver({ gateway: "https://gw.example/ipfs/", proxyPath: "/api/img" });

  test("ipfs URIs resolve through the gateway at the requested width", () => {
    expect(resolve("ipfs://Qm1", { width: 96 })).toBe("https://gw.example/ipfs/Qm1?img-width=96&img-format=webp&img-quality=80");
  });

  test("ipfs URIs default to 1200px", () => {
    expect(resolve("ipfs://Qm1")).toBe("https://gw.example/ipfs/Qm1?img-width=1200&img-format=webp&img-quality=80");
  });

  test("other https hosts go through the image proxy", () => {
    expect(resolve("https://cdn.example.com/a.png")).toBe("/api/img?url=https%3A%2F%2Fcdn.example.com%2Fa.png");
  });

  test("data and relative URLs pass through", () => {
    expect(resolve("data:image/png;base64,AA")).toBe("data:image/png;base64,AA");
    expect(resolve("/placeholder.svg")).toBe("/placeholder.svg");
  });

  test("empty input resolves to null", () => {
    expect(resolve("")).toBeNull();
    expect(resolve(null)).toBeNull();
    expect(resolve(undefined)).toBeNull();
  });

  test("unsupported schemes resolve to the placeholder", () => {
    expect(resolve("javascript:alert(1)")).toBe("/placeholder.svg");
  });
});
