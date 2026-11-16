import type { ComponentType, MutableRefObject } from "react";
import type { LucideIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ApiCollection } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { IPType } from "../../../data/ip.js";
import type { MetadataField } from "../../ip-type-fields.js";
import type { FormValues } from "../form.js";
import type { FastMintSigner, MediaKind, MintedAsset } from "../types.js";
import type { useNewCollectionDraft } from "../use-new-collection-draft.js";
import type { StepInfo } from "../create-then-add.js";

export type MintFormat = "single" | "editions" | "pop" | "tickets" | "club";

export interface FormatShared {
  form: UseFormReturn<FormValues>;
  draft: ReturnType<typeof useNewCollectionDraft>;
  collections: ApiCollection[];
  walletAddress: string;
  mediaKind: MediaKind;
  mediaUri: string;
  mediaName: string;
  image: string;
  previewImage: string | null;
  ipType: IPType;
  onIpTypeChange: (type: IPType) => void;
  templateFieldsRef: MutableRefObject<MetadataField[]>;
  uploadDocument: (file: File) => Promise<string>;
}

export interface FormatRuntime {
  client: MedialaneClient;
  signer: FastMintSigner;
  getUploadToken: () => Promise<string | null>;
  resume: unknown;
  onStep: (step: StepInfo) => void;
}

export interface FormatLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface FormatResult {
  headline: string;
  detail: string;
  name: string;
  collectionLabel?: string;
  links: FormatLink[];
  reward: string;
  asset?: MintedAsset;
}

export interface FormatFieldsProps<S> {
  shared: FormatShared;
  state: S;
  update: (patch: Partial<S>) => void;
}

export interface FormatDefinition<S = unknown> {
  key: MintFormat;
  title: string;
  hint: string;
  icon: LucideIcon;
  submitLabel: (state: S) => string;
  initial: () => S;
  Fields: ComponentType<FormatFieldsProps<S>>;
  isReady: (shared: FormatShared, state: S) => boolean;
  previewLabel: (shared: FormatShared, state: S) => string | undefined;
  submit: (shared: FormatShared, state: S, runtime: FormatRuntime) => Promise<FormatResult>;
}

export function defineFormat<S>(format: FormatDefinition<S>): FormatDefinition {
  return format as unknown as FormatDefinition;
}
