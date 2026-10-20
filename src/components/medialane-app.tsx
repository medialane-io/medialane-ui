"use client";

import { createContext, useContext, type ElementType, type ReactNode } from "react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { FastMintSigner } from "./fast-mint/types.js";
import type { Chain } from "@medialane/sdk";

export interface AssetRef {
  chain: Chain;
  contract: string;
  tokenId: string;
}

export interface CompanionApp {
  title: string;
  description: string;
  icon: ElementType;
  assetUrl: (asset: AssetRef) => string;
}

export interface MedialaneApp {
  getClient: () => MedialaneClient;
  getSigner: () => Promise<FastMintSigner> | FastMintSigner;
  walletAddress: string | null;
  onRequireWallet: () => void;
  connectLabel?: string;
  connectDescription?: string;
  companion?: CompanionApp;
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
