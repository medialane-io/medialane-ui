"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { dropMintState } from "@medialane/sdk/starknet";
import Image from "../../image.js";
import { CreatorChip } from "../../creator-chip.js";
import { ShareButton } from "../../share-button.js";
import { Skeleton } from "../../skeleton.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs.js";
import { AssetLicenseSummary } from "../../asset-license-summary.js";
import { TokenCard } from "../../token-card.js";
import { DropActionBox } from "./drop-action-box.js";
import { DropActivityList } from "./drop-activity.js";
import { DropManage } from "./drop-manage.js";
import { DropMintDialog } from "./drop-mint-dialog.js";
import { GradientButton } from "../../gradient-button.js";
import { ipfsToHttp } from "../../../utils/ipfs.js";
import { useCollectionTokens } from "../../../utils/use-collections.js";
import { useDrop, useDropChain, useDropFee, useDropFile, useDropMints } from "../../../utils/use-drops.js";
import { useNow } from "../../../utils/drop/use-now.js";
import { actionBoxView } from "../../../utils/drop/view.js";
import { claimProofFor } from "../../../utils/drop/claim-proof.js";
import { manageDrop, mintDrop, saveExclusiveContent } from "../../../utils/drop/actions.js";
import { useMedialaneApp } from "../../../utils/app.js";

type TokenFile = { image?: string; attributes?: { trait_type?: string; value?: string }[] };

export function DropPage(props: { contract: string; initialTab?: string; portfolioHref?: string }) {
  const app = useMedialaneApp();
  const { contract } = props;
  const { getClient, walletAddress } = app;
  const { drop: indexed, isLoading } = useDrop(getClient, contract);
  const chain = useDropChain(getClient, contract, walletAddress);
  const { mints, mutate: refreshMints } = useDropMints(getClient, contract);
  const feeBps = useDropFee(getClient);
  const collectionFile = useDropFile<{ drop_kind?: string }>(getClient, indexed?.baseUri ?? null, "collection.json");
  const isCollection = collectionFile?.drop_kind === "collection";
  const firstToken = useDropFile<TokenFile>(getClient, indexed?.baseUri ?? null, "1");
  const { tokens } = useCollectionTokens(getClient, isCollection ? contract : null, 1, 24);
  const now = useNow();
  const [quantity, setQuantity] = useState(1n);
  const [minting, setMinting] = useState(false);
  const proof = useMemo(
    () => (typeof window === "undefined" ? null : claimProofFor(window.localStorage, contract, window.location.hash, "drop-proof")),
    [contract],
  );

  if (isLoading && !chain.drop) {
    return <div className="grid gap-8 lg:grid-cols-2"><Skeleton className="aspect-square rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;
  }
  if (!indexed && !chain.drop) {
    return (
      <div className="space-y-3 py-24 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">This drop wasn't found. A new drop can take a minute to appear.</p>
      </div>
    );
  }

  const onchain = chain.drop;
  // Until the fee is known the mint box counts as loading: no total, no mint button on a guessed fee.
  const priced = feeBps === null ? null : onchain;
  const mint = dropMintState({ drop: priced, wallet: walletAddress, claimed: chain.claimed, proof, balance: chain.balance, feeBps: feeBps ?? 0, now });
  const view = priced ? actionBoxView({ drop: priced, mint, quantity, feeBps: feeBps!, now }) : null;
  const isOrganizer = !!walletAddress && !!onchain && BigInt(walletAddress) === BigInt(onchain.organizer);
  const art = firstToken?.image ?? indexed?.image ?? null;
  const name = indexed?.name ?? "Drop";
  const deps = async () => ({ client: getClient(), signer: await app.getSigner() });

  const onAction = () => {
    if (!view) return;
    if (view.button.action === "sign-in") app.onRequireWallet();
    if (view.button.action === "mint") setMinting(true);
  };

  return (
    <div className="space-y-10 pb-28 lg:pb-0">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {art && <Image src={ipfsToHttp(art)} alt={name} fill unoptimized className="object-cover" />}
        </div>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold">{name}</h1>
              {onchain && <CreatorChip getClient={getClient} address={onchain.organizer} />}
            </div>
            <ShareButton title={name} variant="outline" size="sm" />
          </div>
          {view && onchain && (
            <div className="hidden lg:block">
              <DropActionBox view={view} minted={onchain.totalMinted} maxSupply={onchain.maxSupply} quantity={quantity} onQuantity={setQuantity} onAction={onAction} />
            </div>
          )}
        </div>
      </div>

      {view && onchain && (
        <div className="lg:hidden">
          <DropActionBox view={view} minted={onchain.totalMinted} maxSupply={onchain.maxSupply} quantity={quantity} onQuantity={setQuantity} onAction={onAction} />
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur">
            <GradientButton disabled={view.button.action === "none"} onClick={onAction}>{view.button.label}</GradientButton>
          </div>
        </div>
      )}

      <Tabs defaultValue={props.initialTab === "manage" && isOrganizer ? "manage" : "about"}>
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          {isCollection && <TabsTrigger value="items">Items</TabsTrigger>}
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="license">License</TabsTrigger>
          {isOrganizer && <TabsTrigger value="manage">Manage</TabsTrigger>}
        </TabsList>
        <TabsContent value="about" className="pt-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{indexed?.description || "No description."}</p>
        </TabsContent>
        {isCollection && (
          <TabsContent value="items" className="pt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{tokens.map((t) => <TokenCard key={t.tokenId} token={t} />)}</div>
          </TabsContent>
        )}
        <TabsContent value="activity" className="pt-6"><DropActivityList mints={mints} /></TabsContent>
        <TabsContent value="license" className="pt-6"><AssetLicenseSummary attributes={firstToken?.attributes ?? []} /></TabsContent>
        {isOrganizer && onchain && (
          <TabsContent value="manage" className="pt-6">
            <DropManage
              contract={contract}
              indexed={indexed}
              onchain={onchain}
              mints={mints}
              run={async (params) => {
                await manageDrop(await deps(), { owner: walletAddress!, collection: contract, ...params });
                await Promise.all([chain.mutate(), refreshMints()]);
              }}
              saveExclusive={(value) => saveExclusiveContent(getClient(), contract, value)}
            />
          </TabsContent>
        )}
      </Tabs>

      {view && minting && (
        <DropMintDialog
          open
          onClose={() => setMinting(false)}
          name={name}
          quantity={quantity > view.maxQuantity ? view.maxQuantity : quantity}
          totalText={view.totalText}
          portfolioHref={props.portfolioHref ?? "/portfolio"}
          onMint={async () => {
            const res = await mintDrop(await deps(), { claimer: walletAddress!, collection: contract, quantity: quantity > view.maxQuantity ? view.maxQuantity : quantity, proof });
            await Promise.all([chain.mutate(), refreshMints()]);
            return res;
          }}
        />
      )}
    </div>
  );
}
