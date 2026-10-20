"use client";

import { useEffect, useRef, useState, type ComponentType, type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Image as ImageIcon, Layers, Ticket, Users } from "lucide-react";
import { assetHref, collectionHref, getDerivativesTerm, getService, resolveRemixPolicy, type ApiActivity, type ApiCollection, type ApiOrder, type ApiToken, type Chain } from "@medialane/sdk";
import { useRouter } from "./router.js";
import { PageContainer } from "./page-container.js";
import { PageBackdrop } from "./media-header.js";
import { AssetHeaderBlock, AssetMediaColumn, AssetOwnerRow } from "./asset-top-sections.js";
import { AssetUtilityIcons } from "./asset-utility-icons.js";
import { AssetMarketplacePanel } from "./asset-marketplace-panel.js";
import { AssetOwnersPanel } from "./asset-owners-panel.js";
import { AssetCollectionBar } from "./asset-collection-bar.js";
import { AssetOverviewContent } from "./asset-overview-content.js";
import { AssetMarketsTab } from "./asset-markets-tab.js";
import { AssetProvenanceTab } from "./asset-provenance-tab.js";
import { AssetLightbox } from "./asset-lightbox.js";
import { AssetUnavailable } from "./asset-unavailable.js";
import { HiddenContentBanner } from "./hidden-content-banner.js";
import { DropTokenLink } from "./drop/drop-token-link.js";
import { FloatingCommentsButton } from "./floating-comments-button.js";
import { AssetCommentsDialog, type AssetCommentsProps } from "./asset-comments-dialog.js";
import { MembershipPanel, TicketPanel, type AssetTypePanelProps } from "./asset-type-panels.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";
import { Skeleton } from "./skeleton.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useToken, useTokenBalance, useTokenHistory } from "../utils/use-tokens.js";
import { useCollection, useNearbyCollectionTokens } from "../utils/use-collections.js";
import { useTokenListings } from "../utils/use-orders.js";
import { useTokenRemixes } from "../utils/use-remix-offers.js";
import { useComments } from "../utils/use-comments.js";
import { useFullTokenData } from "../utils/use-full-token-data.js";
import { useAssetMarketState } from "../utils/asset-market-state.js";
import { assetAttributes } from "../utils/asset-attributes.js";
import { ASSET_ACCENTS } from "../utils/asset-accents.js";
import { isLivingRenderCollection } from "../data/living-render-collections.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { ipfsToHttp } from "../utils/ipfs.js";

export type AssetKind = "standard" | "edition" | "ticket" | "membership" | "pop";

export interface AssetMarketContext {
  contract: string;
  tokenId: string;
  tokenName: string;
  tokenImage: string | null;
  tokenStandard: "ERC721" | "ERC1155" | "UNKNOWN";
  activeListings: ApiOrder[];
  quantityOwned?: string;
  mutateListings: () => void;
}

export interface AssetMarketActions {
  isProcessing: boolean;
  buy: (order: ApiOrder) => void;
  list: () => void;
  offer: () => void;
  transfer: () => void;
  cancel: (order: ApiOrder) => void;
  acceptBid: (order: ApiOrder) => void;
  dialogs: ReactNode;
}

export interface AssetReportTarget {
  type: "TOKEN";
  contract: string;
  tokenId: string;
  name?: string;
}

export interface AssetPageSlots {
  useMarketActions: (context: AssetMarketContext) => AssetMarketActions;
  Comments: ComponentType<AssetCommentsProps>;
  Report: ComponentType<{ open: boolean; onOpenChange: (open: boolean) => void; target: AssetReportTarget }>;
  PopBurn: ComponentType<{ collectionAddress: string; tokenId: string }>;
}

interface KindConfig {
  namePrefix: string;
  icon: ElementType;
  accents: (typeof ASSET_ACCENTS)[keyof typeof ASSET_ACCENTS];
  market: boolean;
  remix: boolean;
  Panel?: ComponentType<AssetTypePanelProps>;
}

const KINDS: Record<AssetKind, KindConfig> = {
  standard: { namePrefix: "Token", icon: ImageIcon, accents: ASSET_ACCENTS.standard, market: true, remix: true },
  edition: { namePrefix: "Edition", icon: Layers, accents: ASSET_ACCENTS.edition, market: true, remix: false },
  ticket: { namePrefix: "Ticket", icon: Ticket, accents: ASSET_ACCENTS.ticket, market: true, remix: false, Panel: TicketPanel },
  membership: { namePrefix: "Membership", icon: Users, accents: ASSET_ACCENTS.membership, market: true, remix: false, Panel: MembershipPanel },
  pop: { namePrefix: "POP", icon: Award, accents: ASSET_ACCENTS.standard, market: false, remix: false },
};

const VARIANT_KINDS: Partial<Record<string, AssetKind>> = { edition: "edition", ticket: "ticket", club: "membership", pop: "pop" };

export function detectAssetKind(service: string | null | undefined, standard: string | null | undefined): AssetKind {
  const variant = getService(service)?.uiVariant;
  if (variant) return VARIANT_KINDS[variant] ?? "standard";
  return standard === "ERC1155" ? "edition" : "standard";
}

export function AssetPageSkeleton() {
  return (
    <PageContainer className="pt-20 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-6 items-start">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-[54px] w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[46px] flex-1 rounded-[13px]" />)}
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </PageContainer>
  );
}

export interface AssetPageProps {
  contract: string;
  tokenId: string;
  slots: AssetPageSlots;
}

export function AssetPage({ contract, tokenId, slots }: AssetPageProps) {
  const { token, isLoading, isIndexing } = useToken(contract, tokenId);
  const { collection, isLoading: collectionLoading } = useCollection(contract);
  if (isLoading || collectionLoading) return <AssetPageSkeleton />;
  if (!token) return <AssetUnavailable isIndexing={isIndexing} />;
  const kind = detectAssetKind(collection?.service, collection?.standard ?? token.standard);
  return <AssetPageView contract={contract} tokenId={tokenId} token={token} collection={collection ?? null} kind={kind} slots={slots} />;
}

function AssetPageView({
  contract,
  tokenId,
  token,
  collection,
  kind,
  slots,
}: {
  contract: string;
  tokenId: string;
  token: ApiToken & { isHidden?: boolean };
  collection: ApiCollection | null;
  kind: AssetKind;
  slots: AssetPageSlots;
}) {
  const config = KINDS[kind];
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { walletAddress } = useMedialaneApp();

  const { listings, mutate: mutateListings, isLoading: listingsLoading } = useTokenListings(contract, tokenId);
  const { history } = useTokenHistory(contract, tokenId);
  const { tokens: collectionTokens } = useNearbyCollectionTokens(contract, tokenId);
  const { total: commentTotal } = useComments(contract, tokenId);
  const { total: remixCount } = useTokenRemixes(contract, tokenId);
  const { data: fullTokenData } = useFullTokenData(contract, tokenId);
  const { amount: walletBalance } = useTokenBalance(contract, tokenId, walletAddress);
  const market = useAssetMarketState({ token, collection, listings, history: history as ApiActivity[], walletAddress, walletBalance });

  const [reportOpen, setReportOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const name = token.metadata?.name || `${config.namePrefix} #${token.tokenId}`;
  const image = token.metadata?.image ? ipfsToHttp(token.metadata.image) : null;
  const tokenStandard = kind === "standard" || kind === "pop"
    ? ((token.standard ?? collection?.standard ?? "UNKNOWN") as AssetMarketContext["tokenStandard"])
    : "ERC1155";

  const actions = slots.useMarketActions({
    contract,
    tokenId,
    tokenName: name,
    tokenImage: image,
    tokenStandard,
    activeListings: market.activeListings,
    quantityOwned: market.quantityOwned,
    mutateListings,
  });

  const autoActionRef = useRef(false);
  useEffect(() => {
    if (autoActionRef.current || !config.market || !market.isOwner) return;
    const action = new URLSearchParams(window.location.search).get("action");
    if (action === "list") actions.list();
    else if (action === "transfer") actions.transfer();
    else return;
    autoActionRef.current = true;
  }, [config.market, market.isOwner, actions]);

  const { attributes, hasTemplateData, isDisplayAttr, parentContract, parentTokenId } = assetAttributes(token.metadata?.attributes);
  const remixPolicy = resolveRemixPolicy({
    parentNoDerivatives: getDerivativesTerm(token.metadata?.attributes) === "Not Allowed",
    viewerIsParentOwner: market.isOwner,
    dealAvailable: !!getService(collection?.service),
  });
  const holders = token.balances ?? [];
  const ownerAddress = !market.isERC1155 ? (holders[0]?.owner ?? token.owner ?? null) : null;
  const marketCount = market.activeListings.length + market.activeBids.length;
  const { Panel, icon: FallbackIcon } = config;
  const { Comments, Report, PopBurn } = slots;

  return (
    <div className="relative z-0 min-h-screen">
      {token.isHidden ? <HiddenContentBanner /> : null}
      <PageBackdrop image={image} />

      <PageContainer className="pt-20 space-y-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-8 items-start">
          <AssetMediaColumn
            shouldReduce={Boolean(shouldReduce)}
            image={image}
            imageAlt={name}
            imgError={imgError}
            onImageError={() => setImgError(true)}
            onZoom={() => setLightboxOpen(true)}
            animationUrl={token.metadata?.animationUrl}
            live={isLivingRenderCollection(token.chain as Chain, token.contractAddress)}
            fallback={(
              <div className="aspect-square flex items-center justify-center bg-muted">
                <FallbackIcon className="h-24 w-24 text-muted-foreground/40" />
              </div>
            )}
          />

          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <AssetHeaderBlock
              name={name}
              description={token.metadata?.description}
              ipType={token.metadata?.ipType}
              parentContract={parentContract}
              parentTokenId={parentTokenId}
              badges={kind === "pop" ? (
                <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                  <Award className="h-3 w-3" />
                  POP
                </span>
              ) : null}
              utilities={(
                <AssetUtilityIcons
                  contractExplorerHref={`${EXPLORER_URL}/contract/${token.contractAddress}`}
                  shareTitle={name}
                  onReportClick={() => setReportOpen(true)}
                />
              )}
            />

            {Panel ? <Panel contract={contract} tokenId={tokenId} quantityOwned={market.quantityOwned} /> : null}

            {config.market ? (
              <AssetMarketplacePanel
                asset={token}
                cheapest={market.cheapest}
                usdValue={market.cheapestUsd}
                isOwner={market.isOwner}
                isProcessing={actions.isProcessing}
                isERC1155={market.isERC1155}
                canListMoreEditions={market.canListMoreEditions}
                isMarketLoading={listingsLoading}
                myListing={market.myListing}
                activeBids={market.activeBids}
                remixEnabled={config.remix && remixPolicy.canRemixDirect}
                showDealOption={config.remix && remixPolicy.showDealOption}
                floorPriceRaw={collection?.floorPrice}
                lastSaleRaw={market.lastSaleRaw}
                onCancelClick={actions.cancel}
                onAcceptBid={actions.acceptBid}
                onOpenListing={actions.list}
                onOpenTransfer={actions.transfer}
                onOpenPurchase={actions.buy}
                onOpenOffer={actions.offer}
                onOpenRemix={() => router.push(`/create/remix/${contract}/${tokenId}`)}
              />
            ) : null}

            {kind === "pop" && market.isOwner ? <PopBurn collectionAddress={contract} tokenId={tokenId} /> : null}

            {market.isERC1155 && holders.length > 0 ? (
              <AssetOwnersPanel balances={holders} total={token.holderCount} editions={Number(token.supply ?? 0)} />
            ) : null}

            <div className="pt-5 space-y-5">
              {ownerAddress ? <AssetOwnerRow ownerAddress={ownerAddress} ownerHref={`/creator/${ownerAddress}`} /> : null}
              {collection?.service === "drop-collection" ? <DropTokenLink contract={contract} name={collection.name ?? null} /> : null}
              <AssetCollectionBar
                collectionName={collection?.name ?? contract.slice(0, 8) + "…"}
                collectionImage={collection?.image ? ipfsToHttp(collection.image) : null}
                collectionHref={collectionHref("STARKNET", contract)}
                currentTokenId={tokenId}
                siblingTokens={collectionTokens.map((t) => ({
                  tokenId: t.tokenId,
                  image: t.metadata?.image ? ipfsToHttp(t.metadata.image) : null,
                }))}
                onNavigate={(id) => router.push(assetHref("STARKNET", contract, id))}
              />
            </div>
          </motion.div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {config.market ? <TabsTrigger value="markets">Markets {marketCount > 0 && `(${marketCount})`}</TabsTrigger> : null}
            <TabsTrigger value="provenance">Provenance {history.length > 0 && `(${history.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AssetOverviewContent attributes={attributes} hasTemplateData={hasTemplateData} isDisplayAttr={isDisplayAttr} />
          </TabsContent>

          {config.market ? (
            <TabsContent value="markets">
              <AssetMarketsTab
                activeListings={market.activeListings}
                activeBids={market.activeBids}
                walletAddress={walletAddress ?? undefined}
                isOwner={market.isOwner}
                isProcessing={actions.isProcessing}
                onBuyClick={actions.buy}
                onCancelClick={actions.cancel}
                onAcceptClick={actions.acceptBid}
              />
            </TabsContent>
          ) : null}

          <TabsContent value="provenance">
            <AssetProvenanceTab
              history={history as ApiActivity[]}
              contract={contract}
              tokenId={tokenId}
              remixCount={remixCount}
              originalCreator={fullTokenData?.originalCreator}
              registeredAt={fullTokenData?.registeredAt}
            />
          </TabsContent>
        </Tabs>
      </PageContainer>

      <AssetLightbox open={lightboxOpen} onOpenChange={setLightboxOpen} image={image} alt={name} />
      <FloatingCommentsButton onClick={() => setCommentOpen(true)} commentTotal={commentTotal} />
      <AssetCommentsDialog
        open={commentOpen}
        onOpenChange={setCommentOpen}
        contract={contract}
        tokenId={tokenId}
        name={name}
        imageUrl={image}
        commentTotal={commentTotal}
        Comments={Comments}
        {...config.accents}
      />
      <Report open={reportOpen} onOpenChange={setReportOpen} target={{ type: "TOKEN", contract: token.contractAddress, tokenId: token.tokenId, name }} />
      {actions.dialogs}
    </div>
  );
}
