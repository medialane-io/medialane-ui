import { expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { useImageUrl } from "./use-image-url.js";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";

const appWith = (resolveImage?: MedialaneApp["resolveImage"]) =>
  ({ getClient: () => { throw new Error("unused"); }, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {}, resolveImage }) as MedialaneApp;

test("useImageUrl returns the app's resolver", () => {
  const resolveImage = (uri: string | null | undefined) => (uri ? `app:${uri}` : null);
  const wrapper = ({ children }: { children: ReactNode }) => <MedialaneAppProvider value={appWith(resolveImage)}>{children}</MedialaneAppProvider>;
  const { result } = renderHook(() => useImageUrl(), { wrapper });
  expect(result.current("ipfs://Qm1")).toBe("app:ipfs://Qm1");
});

test("useImageUrl falls back to the default resolver without one", () => {
  const { result } = renderHook(() => useImageUrl());
  expect(result.current("ipfs://Qm1", { width: 96 })).toBe("https://gateway.pinata.cloud/ipfs/Qm1?img-width=96&img-format=webp&img-quality=80");
  expect(result.current("")).toBeNull();
});
