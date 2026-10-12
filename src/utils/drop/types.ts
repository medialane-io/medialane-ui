import type { ProviderInterface } from "starknet";
import type { MedialaneClient, ReceiptProvider } from "@medialane/sdk/starknet";
import type { FastMintSigner } from "../../components/fast-mint/types.js";

export type DropSigner = FastMintSigner;

/** Receipts for confirmations, contract reads for live drop state. */
export type DropProvider = ReceiptProvider & Pick<ProviderInterface, "callContract">;

/** What every drop screen takes from the app. */
export interface DropAppProps {
  getClient: () => MedialaneClient;
  provider: DropProvider;
  getSigner: () => Promise<DropSigner> | DropSigner;
  walletAddress: string | null;
  onRequireWallet: () => void;
  connectLabel?: string;
}
