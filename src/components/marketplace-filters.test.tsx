import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { useMarketplaceFilters } from "./marketplace-filters.js";

afterEach(() => cleanup());

describe("useMarketplaceFilters", () => {
  test("starts with nothing applied", () => {
    const { result } = renderHook(() => useMarketplaceFilters());
    expect(result.current.count).toBe(0);
    expect(result.current.sort).toBe("recent");
    expect(result.current.minPrice).toBeUndefined();
  });

  test("counts each kind of filter once", () => {
    const { result } = renderHook(() => useMarketplaceFilters());
    act(() => { result.current.setSort("price_asc"); result.current.setOrderType("offers"); });
    expect(result.current.count).toBe(2);
  });

  test("choosing a currency clears the price range, and choosing it again removes it", () => {
    const { result } = renderHook(() => useMarketplaceFilters());
    act(() => { result.current.setMinInput("5"); });
    act(() => { result.current.selectCurrency("USDC"); });
    expect(result.current.currency).toBe("USDC");
    expect(result.current.minInput).toBe("");
    act(() => { result.current.selectCurrency("USDC"); });
    expect(result.current.currency).toBe("");
  });

  test("the price range becomes raw amounts in the currency's decimals once typing pauses", async () => {
    const { result } = renderHook(() => useMarketplaceFilters());
    act(() => { result.current.selectCurrency("USDC"); });
    act(() => { result.current.setMinInput("1.5"); });
    await waitFor(() => expect(result.current.minPrice).toBe("1500000"));
  });

  test("clear all resets everything", () => {
    const { result } = renderHook(() => useMarketplaceFilters());
    act(() => { result.current.setSort("price_desc"); result.current.setOrderType("listings"); result.current.selectCurrency("STRK"); });
    act(() => { result.current.reset(); });
    expect(result.current.count).toBe(0);
    expect(result.current.currency).toBe("");
  });
});
