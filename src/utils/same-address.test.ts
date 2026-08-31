import { test, expect } from "bun:test";
import { isSameAddress } from "./same-address.js";

const PADDED = "0x036a8f48641d42dba28375c31651aa14a4413582da2db7655a362a9e4ffc20d2";
const SHORT = "0x36a8f48641d42dba28375c31651aa14a4413582da2db7655a362a9e4ffc20d2";
const OTHER = "0x000c9c2997100000000000000000000000000000000000000000000000022592";

test("the same account written with and without leading zeros is one account", () => {
  expect(isSameAddress(PADDED, SHORT)).toBe(true);
  expect(isSameAddress(SHORT, PADDED)).toBe(true);
});

test("string comparison would have got this wrong, which is the bug", () => {
  expect(PADDED.toLowerCase() === SHORT.toLowerCase()).toBe(false);
  expect(isSameAddress(PADDED, SHORT)).toBe(true);
});

test("case does not make two spellings different accounts", () => {
  expect(isSameAddress(PADDED.toUpperCase().replace("0X", "0x"), SHORT)).toBe(true);
});

test("different accounts stay different", () => {
  expect(isSameAddress(PADDED, OTHER)).toBe(false);
});

test("a missing address matches nothing, rather than matching everything", () => {
  expect(isSameAddress(null, PADDED)).toBe(false);
  expect(isSameAddress(PADDED, undefined)).toBe(false);
  expect(isSameAddress(undefined, null)).toBe(false);
  expect(isSameAddress("", PADDED)).toBe(false);
});

test("unparseable input does not throw, and does not falsely match", () => {
  expect(isSameAddress("not-an-address", PADDED)).toBe(false);
  expect(isSameAddress("not-an-address", "not-an-address")).toBe(true);
});
