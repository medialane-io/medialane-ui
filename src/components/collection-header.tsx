"use client";

import type { ReactNode } from "react";
import { Layers } from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import { AssetHeaderBlock } from "./asset-top-sections.js";
import { MediaHeader, HeaderStats, HeaderStat } from "./media-header.js";
import { CreatorChip } from "./creator-chip.js";
import { CurrencyAmount } from "./currency-icon.js";
import { parsePriceDisplay } from "../utils/format.js";
import { useImageUrl } from "../utils/use-image-url.js";

const CHIP = "text-2xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground";

export interface CollectionHeaderProps {
  collection: ApiCollection | null | undefined;
  loading?: boolean;
  children?: ReactNode;
}

function PriceStat({ label, raw }: { label: string; raw: string | null }) {
  const { numStr, symbol } = parsePriceDisplay(raw);
  if (!symbol || numStr === "—") return null;
  return (
    <HeaderStat label={label}>
      <CurrencyAmount amount={numStr} symbol={symbol} iconSize={12} />
    </HeaderStat>
  );
}

export function CollectionHeader({ collection, loading = false, children }: CollectionHeaderProps) {
  const resolveImage = useImageUrl();
  const image = resolveImage(collection?.image);
  const name = collection?.name ?? "Unnamed Collection";

  return (
    <MediaHeader image={image} imageAlt={name} fallbackIcon={Layers} loading={loading || !collection}>
      {collection ? (
        <>
          <AssetHeaderBlock
            name={name}
            description={collection.description}
            badges={(
              <>
                {collection.standard === "ERC1155" ? <span className={CHIP}>Multi-edition</span> : null}
                {collection.symbol ? <span className={CHIP}>{collection.symbol}</span> : null}
              </>
            )}
          />

          <HeaderStats>
            {collection.totalSupply != null ? <HeaderStat label="Items">{collection.totalSupply.toLocaleString()}</HeaderStat> : null}
            {collection.holderCount != null ? <HeaderStat label="Holders">{collection.holderCount.toLocaleString()}</HeaderStat> : null}
            <PriceStat label="Floor" raw={collection.floorPrice} />
            <PriceStat label="Volume" raw={collection.totalVolume} />
          </HeaderStats>

          {collection.owner ? <CreatorChip address={collection.owner} /> : null}

          {children}
        </>
      ) : null}
    </MediaHeader>
  );
}
