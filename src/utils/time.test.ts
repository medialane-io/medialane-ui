import { test, expect } from "bun:test";
import { isExpired, timeUntil } from "./time.js";

const secs = (offset: number) => String(Math.floor(Date.now() / 1000) + offset);

test("an order whose window has passed is expired", () => {
  expect(isExpired(secs(-60))).toBe(true);
});

test("an order still inside its window is not expired", () => {
  expect(isExpired(secs(3600))).toBe(false);
});

test("endTime 0 means no expiry, in both string and number form", () => {
  expect(isExpired(0)).toBe(false);
  expect(isExpired("0")).toBe(false);
});

test("missing or empty endTime never marks an order dead", () => {
  expect(isExpired(null)).toBe(false);
  expect(isExpired(undefined)).toBe(false);
  expect(isExpired("")).toBe(false);
});

test("unparseable input is treated as live rather than silently blocking an action", () => {
  expect(isExpired("not-a-date")).toBe(false);
});

test("epoch seconds are read as seconds, not milliseconds", () => {
  expect(isExpired(secs(3600))).toBe(false);
  expect(isExpired(Math.floor(Date.now() / 1000) + 3600)).toBe(false);
});

test("isExpired agrees with what timeUntil already displays", () => {
  const past = secs(-60);
  const future = secs(3600);
  expect(timeUntil(past)).toBe("Expired");
  expect(isExpired(past)).toBe(true);
  expect(timeUntil(future)).not.toBe("Expired");
  expect(isExpired(future)).toBe(false);
});

test("ISO date strings are supported alongside epoch seconds", () => {
  expect(isExpired(new Date(Date.now() - 60_000).toISOString())).toBe(true);
  expect(isExpired(new Date(Date.now() + 60_000).toISOString())).toBe(false);
});
