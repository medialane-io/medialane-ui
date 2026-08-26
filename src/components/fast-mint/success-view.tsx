"use client";

import Link from "../link.js";
import { CheckCircle2, Eye, Tag, ArrowRightLeft, GitBranch } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { Button } from "../button.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import type { MintedAsset } from "./types.js";

export interface SuccessViewProps {
  presentation?: "inline" | "dialog";
  previewImage: string | null;
  name: string;
  collectionLabel?: string;
  mintedAsset: MintedAsset | null;
  onPublishAnother: () => void;
}

export function SuccessView({
  presentation = "inline",
  previewImage,
  name,
  collectionLabel,
  mintedAsset,
  onPublishAnother,
}: SuccessViewProps) {
  return (
    <section className={cn(presentation === "dialog" ? "" : "rounded-2xl border border-border p-6 sm:p-8")}>
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 items-start">
        <MedialaneCollectionCard image={previewImage} name={name} collection={collectionLabel} />
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-semibold">Published — live onchain</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {mintedAsset ? "Ready to share, sell, or remix." : "It'll appear in your portfolio shortly."}
            </p>
          </div>

          {mintedAsset && (
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={`/asset/STARKNET/${mintedAsset.contract}/${mintedAsset.tokenId}`}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                View asset
              </Link>
              <Link
                href={`/asset/STARKNET/${mintedAsset.contract}/${mintedAsset.tokenId}?action=list`}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
              >
                <Tag className="h-4 w-4 text-muted-foreground" />
                List on marketplace
              </Link>
              <Link
                href={`/asset/STARKNET/${mintedAsset.contract}/${mintedAsset.tokenId}?action=transfer`}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                Transfer
              </Link>
              <Link
                href={`/create/remix/${mintedAsset.contract}/${mintedAsset.tokenId}`}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
              >
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                Create a remix
              </Link>
            </div>
          )}

          <Button variant="outline" onClick={onPublishAnother} className="w-full sm:w-auto">
            Publish another
          </Button>
        </div>
      </div>
    </section>
  );
}
