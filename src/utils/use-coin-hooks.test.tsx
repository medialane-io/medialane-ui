import { expect, test, afterEach } from "bun:test";
import { cleanup, render, renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { useCoinSupply } from "./use-coin-supply.js";
import { useCoinGuarantees } from "./use-coin-guarantees.js";
import { useOnOpen } from "./use-on-open.js";

afterEach(() => cleanup());

function wrapper(api: unknown) {
  const client = { api } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return ({ children }: { children: React.ReactNode }) => <MedialaneAppProvider value={app}>{children}</MedialaneAppProvider>;
}

test("coin supply is read through the app client and scaled by decimals", async () => {
  const { result } = renderHook(() => useCoinSupply("0xcoin-supply", 2), { wrapper: wrapper({ coins: { get: async () => ({ totalSupply: "12345" }) } }) });
  await waitFor(() => expect(result.current.supply).toBe(123));
  expect(result.current.raw).toBe(12345n);
});

test("coin guarantees stay empty when the lookup is switched off", async () => {
  const { result } = renderHook(() => useCoinGuarantees("0xcoin-guarantees", false), { wrapper: wrapper({ chainReads: { coinGuarantees: async () => { throw new Error("unused"); } } }) });
  expect(result.current.guarantees).toBeNull();
  expect(result.current.isLoading).toBe(false);
});

test("useOnOpen runs the latest callback each time it opens", () => {
  const seen: string[] = [];
  function Probe({ open, tag }: { open: boolean; tag: string }) {
    useOnOpen(open, () => seen.push(tag));
    return null;
  }
  const view = render(<Probe open={false} tag="a" />);
  view.rerender(<Probe open tag="b" />);
  view.rerender(<Probe open={false} tag="c" />);
  view.rerender(<Probe open tag="d" />);
  expect(seen).toEqual(["b", "d"]);
});
