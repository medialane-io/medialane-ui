import type { Call, TypedData } from "starknet";
import type { ApiCollection } from "@medialane/sdk";
import type { MedialaneClient, ReceiptProvider } from "@medialane/sdk/starknet";

export type MediaKind = "image" | "audio" | "video" | "document";

export interface FastMintSigner {
  readonly address: string;
  execute(calls: Call[]): Promise<{ txHash: string }>;
  signTypedData(data: TypedData): Promise<string[]>;
}

export interface MintedAsset {
  contract: string;
  tokenId: string;
  image: string | null;
}

export interface FastMintProps {
  presentation?: "inline" | "dialog";
  open?: boolean;
  onClose?: () => void;

  mediaKindLock?: MediaKind;
  onMinted?: (asset: MintedAsset) => void;

  collections: ApiCollection[];
  refetchCollections: () => Promise<ApiCollection[]>;

  hasWallet: boolean;
  walletAddress: string | null;
  onRequireWallet: () => void;
  connectLabel?: string;
  getUploadToken: () => Promise<string | null>;
  getSigner: () => Promise<FastMintSigner> | FastMintSigner;
  client: MedialaneClient;
  provider: ReceiptProvider;
}
