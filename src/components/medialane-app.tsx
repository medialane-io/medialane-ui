"use client";

import { createContext, useContext, type ComponentType, type ElementType, type ReactNode } from "react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { FastMintSigner } from "./fast-mint/types.js";
import type { ApiToken } from "@medialane/sdk";
import type { ImageResolver } from "../utils/ipfs.js";

export type AssetRef = Pick<ApiToken, "chain" | "contractAddress" | "tokenId">;

export interface CompanionApp {
  title: string;
  description: string;
  icon: ElementType;
  origin: string;
}

export type ReportTarget =
  | { type: "TOKEN"; contract: string; tokenId: string; name?: string }
  | { type: "COLLECTION"; contract: string; name?: string }
  | { type: "CREATOR"; address: string; name?: string };

export type ReportDialogSlot = ComponentType<{ open: boolean; onOpenChange: (open: boolean) => void; target: ReportTarget }>;

export interface MedialaneApp {
  getClient: () => MedialaneClient;
  getSigner: () => Promise<FastMintSigner> | FastMintSigner;
  walletAddress: string | null;
  walletLoading?: boolean;
  onRequireWallet: () => void;
  ensureSignedIn?: () => Promise<void>;
  connectLabel?: string;
  connectDescription?: string;
  companion?: CompanionApp;
  ReportDialog?: ReportDialogSlot;
  resolveImage?: ImageResolver;
}

export const MedialaneAppContext = createContext<MedialaneApp | null>(null);

export function MedialaneAppProvider({ value, children }: { value: MedialaneApp; children: ReactNode }) {
  return <MedialaneAppContext.Provider value={value}>{children}</MedialaneAppContext.Provider>;
}

export function useMedialaneApp(): MedialaneApp {
  const app = useContext(MedialaneAppContext);
  if (!app) throw new Error("MedialaneAppProvider missing");
  return app;
}
