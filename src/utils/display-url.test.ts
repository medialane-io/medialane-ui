import { test, expect } from "bun:test";
import { toDisplayUrl, toDisplayUrlOrNull, toAbsoluteImageUrl } from "./ipfs.js";

const G = "https://gateway.pinata.cloud/ipfs/";
const CID = "bafybeif44ivsaive7an4l55lhvlap56qjjqprxkzvngpcd2b675dkdryga";

test("an ipfs reference resolves to the configured gateway", () => {
  expect(toDisplayUrl(`ipfs://${CID}`)).toContain(`${G}${CID}`);
});

test("a different gateway is honoured", () => {
  const out = toDisplayUrl(`ipfs://${CID}`, { gateway: "https://my.mypinata.cloud/ipfs/" });
  expect(out).toContain("my.mypinata.cloud");
});

test("an external https image goes through the proxy rather than direct", () => {
  expect(toDisplayUrl("https://example.com/a.png")).toBe(
    "/api/img?url=" + encodeURIComponent("https://example.com/a.png"),
  );
});

test("a data image URI is returned untouched", () => {
  const d = "data:image/png;base64,AAAA";
  expect(toDisplayUrl(d)).toBe(d);
});

test("nothing resolvable yields the placeholder, never an empty src", () => {
  expect(toDisplayUrl(null)).toBe("/placeholder.svg");
  expect(toDisplayUrl("")).toBe("/placeholder.svg");
  expect(toDisplayUrl("not-a-url")).toBe("/placeholder.svg");
});

test("the optional form distinguishes absent from unresolvable", () => {
  expect(toDisplayUrlOrNull(null)).toBeNull();
  expect(toDisplayUrlOrNull("")).toBeNull();
  expect(toDisplayUrlOrNull("not-a-url")).toBe("/placeholder.svg");
});

test("a local path is passed through, so app assets still render", () => {
  expect(toDisplayUrlOrNull("/placeholder.svg")).toBe("/placeholder.svg");
  expect(toDisplayUrlOrNull("/img/logo.png")).toBe("/img/logo.png");
});

test("a stored route path is not treated as an image reference", () => {
  // A profile once held /api/ipfs/<cid>, a link to a route that was later
  // deleted. Passing a path through is why that rendered as a broken image.
  const dead = `/api/ipfs/${CID}`;
  expect(toDisplayUrlOrNull(dead)).toBe(dead);
});

test("a crawler URL is absolute, never an app-relative route", () => {
  const out = toAbsoluteImageUrl(`ipfs://${CID}`);
  expect(out.startsWith("https://")).toBe(true);
});

test("an external image stays absolute rather than routing through the proxy", () => {
  expect(toAbsoluteImageUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
});

test("no image yields an empty string, not a broken URL", () => {
  expect(toAbsoluteImageUrl(null)).toBe("");
  expect(toAbsoluteImageUrl("")).toBe("");
});
