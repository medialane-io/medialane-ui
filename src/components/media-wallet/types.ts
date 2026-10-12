import { createContext, useContext, type ReactNode } from "react";
import type { ProviderInterface } from "starknet";
import type { MediaWallet, MedialaneClient, StarknetVenueSigner } from "@medialane/sdk/starknet";
import type { WalletToken } from "../../utils/media-wallet/wallet-tokens.js";

export type MediaWalletView =
  | { name: "home"; autoOpenReceive?: boolean }
  | { name: "send"; token?: WalletToken }
  | { name: "token"; token: WalletToken }
  | { name: "activity" };

export type WalletWriteStatus = "idle" | "processing" | "confirming" | "success" | "error";

export interface WalletWriteAction {
  run: (execute: (signer: StarknetVenueSigner) => Promise<{ txHash: string } | void>) => Promise<void>;
  status: WalletWriteStatus;
  reset: () => void;
  error: string | null;
}

export interface MediaWalletSession {
  address: string | null;
  hasWallet: boolean;
  isDeployed: boolean | null;
  signer: StarknetVenueSigner | null;
}

export interface MediaWalletAppProps {
  getClient: () => MedialaneClient;
  provider: ProviderInterface;
  wallet: Pick<MediaWallet, "completeDeployment">;
  session: MediaWalletSession;
  useWriteAction: () => WalletWriteAction;
  resolveImage: (uri: string | null | undefined) => string | null;
  explorerUrl: string;
  accountEmail: string | null;
  emailStatus: { email: string | null; emailVerified: boolean; deadline?: string | null } | null;
  emailBanner: { href: string; text: (deadline: string | null | undefined) => string };
  externalWallet: { href: string; label: string };
  headerIdentity?: { avatarUrl?: string | null; headline?: string; badge?: ReactNode };
}

export const MediaWalletAppContext = createContext<MediaWalletAppProps | null>(null);

export function useMediaWalletApp(): MediaWalletAppProps {
  const app = useContext(MediaWalletAppContext);
  if (!app) throw new Error("useMediaWalletApp must be used inside MediaWalletOverlay");
  return app;
}
