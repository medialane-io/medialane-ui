"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Layers } from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import { AssetHeaderBlock, AssetMediaColumn } from "./asset-top-sections.js";
import { AssetUtilityIcons } from "./asset-utility-icons.js";
import { AddressDisplay } from "./address-display.js";
import { CreatorChip } from "./creator-chip.js";
import { CurrencyAmount } from "./currency-icon.js";
import { Skeleton } from "./skeleton.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { parsePriceDisplay } from "../utils/format.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";

const CHIP = "text-2xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground";

export interface CollectionHeaderProps {
  collection: ApiCollection | null | undefined;
  loading?: boolean;
  onReportClick: () => void;
  children?: ReactNode;
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{children}</span>
    </span>
  );
}

function PriceStat({ label, raw }: { label: string; raw: string | null }) {
  const { numStr, symbol } = parsePriceDisplay(raw);
  if (!symbol || numStr === "—") return null;
  return (
    <Stat label={label}>
      <CurrencyAmount amount={numStr} symbol={symbol} iconSize={12} />
    </Stat>
  );
}

export function CollectionHeader({ collection, loading = false, onReportClick, children }: CollectionHeaderProps) {
  const shouldReduce = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  if (loading || !collection) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const image = collection.image ? ipfsToHttp(collection.image) : null;
  const name = collection.name ?? "Unnamed Collection";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110"
            style={{ filter: "blur(60px) saturate(1.5)" }}
          />
        )}
      </div>

      <AssetMediaColumn
        shouldReduce={Boolean(shouldReduce)}
        image={image}
        imageAlt={name}
        imgError={imgError}
        onImageError={() => setImgError(true)}
        fallback={(
          <div className="aspect-square flex items-center justify-center bg-muted">
            <Layers className="h-24 w-24 text-muted-foreground/40" />
          </div>
        )}
      />

      <div className="space-y-5 min-w-0">
        <AssetHeaderBlock
          name={name}
          description={collection.description}
          badges={(
            <>
              <span className={CHIP}>{collection.standard === "ERC1155" ? "Multi-edition" : "Single NFT"}</span>
              {collection.symbol ? <span className={CHIP}>{collection.symbol}</span> : null}
            </>
          )}
          utilities={(
            <AssetUtilityIcons
              contractExplorerHref={`${EXPLORER_URL}/contract/${collection.contractAddress}`}
              shareTitle={name}
              onReportClick={onReportClick}
            />
          )}
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {collection.totalSupply != null ? <Stat label="Items">{collection.totalSupply.toLocaleString()}</Stat> : null}
          {collection.holderCount != null ? <Stat label="Holders">{collection.holderCount.toLocaleString()}</Stat> : null}
          <PriceStat label="Floor" raw={collection.floorPrice} />
          <PriceStat label="Volume" raw={collection.totalVolume} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {collection.owner ? <CreatorChip address={collection.owner} /> : null}
          <AddressDisplay address={collection.contractAddress} chars={6} className="text-xs text-muted-foreground" />
        </div>

        {children}
      </div>
    </div>
  );
}
