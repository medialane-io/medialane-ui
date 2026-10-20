"use client";

import type { ReactNode } from "react";
import { Layers } from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import { AssetHeaderBlock } from "./asset-top-sections.js";
import { MediaHeader, HeaderStats, HeaderStat } from "./media-header.js";
import { AssetUtilityIcons } from "./asset-utility-icons.js";
import { AddressDisplay } from "./address-display.js";
import { CreatorChip } from "./creator-chip.js";
import { CurrencyAmount } from "./currency-icon.js";
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

function PriceStat({ label, raw }: { label: string; raw: string | null }) {
  const { numStr, symbol } = parsePriceDisplay(raw);
  if (!symbol || numStr === "—") return null;
  return (
    <HeaderStat label={label}>
      <CurrencyAmount amount={numStr} symbol={symbol} iconSize={12} />
    </HeaderStat>
  );
}

export function CollectionHeader({ collection, loading = false, onReportClick, children }: CollectionHeaderProps) {
  const image = collection?.image ? ipfsToHttp(collection.image) : null;
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

          <HeaderStats>
            {collection.totalSupply != null ? <HeaderStat label="Items">{collection.totalSupply.toLocaleString()}</HeaderStat> : null}
            {collection.holderCount != null ? <HeaderStat label="Holders">{collection.holderCount.toLocaleString()}</HeaderStat> : null}
            <PriceStat label="Floor" raw={collection.floorPrice} />
            <PriceStat label="Volume" raw={collection.totalVolume} />
          </HeaderStats>

          <div className="flex flex-wrap items-center gap-2">
            {collection.owner ? <CreatorChip address={collection.owner} /> : null}
            <AddressDisplay address={collection.contractAddress} chars={6} className="text-xs text-muted-foreground" />
          </div>

          {children}
        </>
      ) : null}
    </MediaHeader>
  );
}
