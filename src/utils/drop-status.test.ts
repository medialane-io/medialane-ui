import { test, expect } from "bun:test";
import { getDropStatus, type DropConditions } from "./drop-status.js";

const baseConditions: DropConditions = {
  maxSupply: "10",
  price: "0",
  paymentToken: "0x0",
  startTime: 0,
  endTime: 0,
  maxPerWallet: "1",
};

test("returns live when no conditions are set yet", () => {
  expect(getDropStatus(null, 0)).toBe("live");
});

test("returns sold_out once minted reaches max supply", () => {
  expect(getDropStatus({ ...baseConditions, startTime: 0, endTime: 9999999999 }, 10)).toBe("sold_out");
});

test("returns upcoming before the start time", () => {
  const future = Math.floor(Date.now() / 1000) + 3600;
  expect(getDropStatus({ ...baseConditions, startTime: future, endTime: future + 3600 }, 0)).toBe("upcoming");
});

test("returns ended after the end time", () => {
  const past = Math.floor(Date.now() / 1000) - 3600;
  expect(getDropStatus({ ...baseConditions, startTime: past - 3600, endTime: past }, 0)).toBe("ended");
});

test("returns live between start and end", () => {
  const now = Math.floor(Date.now() / 1000);
  expect(getDropStatus({ ...baseConditions, startTime: now - 60, endTime: now + 60 }, 0)).toBe("live");
});
