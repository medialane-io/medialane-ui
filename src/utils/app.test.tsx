import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, useMedialaneApp, type MedialaneApp } from "./app.js";

const app: MedialaneApp = {
  getClient: () => ({}) as MedialaneClient,
  getSigner: () => ({ address: "0xa", execute: async () => ({ txHash: "0x1" }), signTypedData: async () => [] }),
  walletAddress: "0xa",
  onRequireWallet: () => {},
};

test("useMedialaneApp returns the provided app", () => {
  const wrapper = ({ children }: { children: ReactNode }) => <MedialaneAppProvider value={app}>{children}</MedialaneAppProvider>;
  const { result } = renderHook(() => useMedialaneApp(), { wrapper });
  expect(result.current).toBe(app);
});

test("useMedialaneApp outside a provider throws", () => {
  expect(() => renderHook(() => useMedialaneApp())).toThrow("MedialaneAppProvider missing");
});
