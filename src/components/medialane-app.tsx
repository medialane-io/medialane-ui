"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { FastMintSigner } from "./fast-mint/types.js";

export interface MedialaneApp {
  getClient: () => MedialaneClient;
  getSigner: () => Promise<FastMintSigner> | FastMintSigner;
  walletAddress: string | null;
  onRequireWallet: () => void;
  connectLabel?: string;
}

const MedialaneAppContext = createContext<MedialaneApp | null>(null);

export function MedialaneAppProvider({ value, children }: { value: MedialaneApp; children: ReactNode }) {
  return <MedialaneAppContext.Provider value={value}>{children}</MedialaneAppContext.Provider>;
}

export function useMedialaneApp(): MedialaneApp {
  const app = useContext(MedialaneAppContext);
  if (!app) throw new Error("MedialaneAppProvider missing");
  return app;
}
