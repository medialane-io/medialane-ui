import { describe, it, expect } from "bun:test";
import { orderCoins } from "./coin-order.js";

const item = (contractAddress: string) => ({ contractAddress });

describe("orderCoins", () => {
  it("returns items unchanged when no price map is supplied", () => {
    const items = [item("a"), item("b")];
    expect(orderCoins(items)).toBe(items);
  });

  it("puts unpriced coins after priced coins", () => {
    const items = [item("a"), item("b"), item("c")];
    const prices = { a: null, b: 2, c: null };
    expect(orderCoins(items, prices).map((i) => i.contractAddress)).toEqual(["b", "a", "c"]);
  });

  it("preserves incoming order within each group when no sort is requested", () => {
    const items = [item("a"), item("b"), item("c"), item("d")];
    const prices = { a: 1, b: null, c: 2, d: null };
    expect(orderCoins(items, prices).map((i) => i.contractAddress)).toEqual(["a", "c", "b", "d"]);
  });

  it("sorts priced coins descending, unpriced still trailing", () => {
    const items = [item("a"), item("b"), item("c"), item("d")];
    const prices = { a: 1, b: null, c: 5, d: 3 };
    expect(orderCoins(items, prices, "desc").map((i) => i.contractAddress)).toEqual(["c", "d", "a", "b"]);
  });

  it("sorts priced coins ascending, unpriced still trailing", () => {
    const items = [item("a"), item("b"), item("c"), item("d")];
    const prices = { a: 1, b: null, c: 5, d: 3 };
    expect(orderCoins(items, prices, "asc").map((i) => i.contractAddress)).toEqual(["a", "d", "c", "b"]);
  });
});
