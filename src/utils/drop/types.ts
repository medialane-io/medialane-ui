import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { FastMintSigner } from "../../components/fast-mint/types.js";

export type DropSigner = FastMintSigner;

/** What every drop screen takes from the app. */
export interface DropAppProps {
  getClient: () => MedialaneClient;
  getSigner: () => Promise<DropSigner> | DropSigner;
  walletAddress: string | null;
  onRequireWallet: () => void;
  connectLabel?: string;
}
