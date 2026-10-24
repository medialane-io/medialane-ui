"use client";

import { useState } from "react";
import { CheckCircle2, Handshake, Loader2, X } from "lucide-react";
import { assetHref, type ApiSponsorshipOffer } from "@medialane/sdk";
import { AddressDisplay } from "./address-display.js";
import { Button } from "./button.js";
import Link from "./link.js";
import { useMedialaneApp } from "./medialane-app.js";
import { Skeleton } from "./skeleton.js";
import { TransactionDialog } from "./transaction-dialog.js";
import { TransactionDone } from "./transaction-done.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { useSponsorshipBids, useSponsorshipLicenses, useSponsorshipOffers, useSponsorshipProposals } from "../utils/use-sponsorship.js";
import { useTransaction } from "../utils/use-transaction.js";

type Api = ReturnType<ReturnType<typeof useMedialaneApp>["getClient"]>["api"];

function useRowAction(copy: { title: string; working: string; done: string; description: string }) {
  const app = useMedialaneApp();
  const tx = useTransaction();
  const [activeId, setActiveId] = useState<string | null>(null);
  const busy = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  const run = (id: string, create: (api: Api) => ReturnType<Parameters<typeof runIntentCalls>[1]>, then: () => Promise<unknown>) => {
    setActiveId(id);
    void tx
      .run(async (signer) => {
        await runIntentCalls(signer, () => create(app.getClient().api));
      })
      .then(() => then())
      .finally(() => setActiveId(null));
  };

  const dialog = (
    <TransactionDialog tx={tx} title={copy.title} workingLabel={copy.working} firstStepLabel="Prepare">
      <TransactionDone tx={tx} name={copy.title} title={copy.done} description={copy.description} />
    </TransactionDialog>
  );

  return { run, dialog, busy, activeId };
}

function Spinner({ active, idle, className }: { active: boolean; idle: React.ReactNode; className?: string }) {
  return active ? <Loader2 className={`h-3 w-3 animate-spin ${className ?? ""}`} /> : <>{idle}</>;
}

function OfferBidsRow({ offer }: { offer: ApiSponsorshipOffer }) {
  const { walletAddress } = useMedialaneApp();
  const { bids, isLoading, mutate } = useSponsorshipBids(offer.offerId);
  const action = useRowAction({ title: "Accept bid", working: "Accepting the bid…", done: "Bid accepted!", description: "The license is minted to the sponsor." });

  if (isLoading || bids.length === 0) return null;

  return (
    <div className="space-y-1.5 rounded-lg bg-muted/30 p-3">
      {action.dialog}
      <p className="text-xs font-semibold text-muted-foreground">
        Bids on <Link href={assetHref("STARKNET", offer.nftContract, offer.tokenId)} className="underline underline-offset-2">View asset</Link>
      </p>
      {bids.map((bid) => (
        <div key={bid.id} className="flex items-center justify-between gap-2 text-xs">
          <AddressDisplay address={bid.sponsor} chars={4} showCopy={false} className="text-muted-foreground" />
          <Button
            size="sm"
            className="bg-brand-rose hover:brightness-110 text-white h-7 px-2.5"
            aria-label="Accept bid"
            disabled={action.busy || !walletAddress}
            onClick={() =>
              action.run(
                bid.id,
                (api) => api.intents.create("sponsorship-bid-accept", { author: walletAddress!, offerId: offer.offerId, sponsor: bid.sponsor }),
                () => mutate(),
              )
            }
          >
            <Spinner active={action.busy && action.activeId === bid.id} idle={<CheckCircle2 className="h-3 w-3" />} />
          </Button>
        </div>
      ))}
    </div>
  );
}

function ReceivedProposals({ walletAddress }: { walletAddress: string }) {
  const { proposals, isLoading, mutate } = useSponsorshipProposals({ owner: walletAddress, open: true });
  const action = useRowAction({ title: "Respond to proposal", working: "Sending your response…", done: "Response sent!", description: "Your response is now on-chain." });

  if (isLoading) return <Skeleton className="h-20 w-full rounded-xl" />;
  if (proposals.length === 0) return <p className="text-sm text-muted-foreground">No proposals awaiting your decision.</p>;

  const respond = (proposalId: string, decision: "accept" | "reject") =>
    action.run(
      proposalId,
      (api) =>
        decision === "accept"
          ? api.intents.create("sponsorship-proposal-accept", { owner: walletAddress, proposalId })
          : api.intents.create("sponsorship-proposal-reject", { owner: walletAddress, proposalId }),
      () => mutate(),
    );

  return (
    <div className="space-y-2">
      {action.dialog}
      {proposals.map((p) => (
        <div key={p.id} className="bento-cell p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              <Link href={assetHref("STARKNET", p.nftContract, p.tokenId)} className="hover:underline">View asset</Link>
            </p>
            <p className="text-xs text-muted-foreground">
              <AddressDisplay address={p.proposer} chars={4} showCopy={false} /> proposed {p.amount}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" variant="outline" aria-label="Decline proposal" disabled={action.busy} onClick={() => respond(p.proposalId, "reject")}>
              <Spinner active={action.busy && action.activeId === p.proposalId} idle={<X className="h-3 w-3" />} />
            </Button>
            <Button size="sm" className="bg-brand-rose hover:brightness-110 text-white" aria-label="Accept proposal" disabled={action.busy} onClick={() => respond(p.proposalId, "accept")}>
              <Spinner active={action.busy && action.activeId === p.proposalId} idle={<CheckCircle2 className="h-3 w-3" />} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SentProposals({ walletAddress }: { walletAddress: string }) {
  const { proposals, isLoading, mutate } = useSponsorshipProposals({ proposer: walletAddress, open: true });
  const action = useRowAction({ title: "Withdraw proposal", working: "Withdrawing your proposal…", done: "Proposal withdrawn!", description: "Your proposal is no longer open." });

  if (isLoading) return <Skeleton className="h-20 w-full rounded-xl" />;
  if (proposals.length === 0) return <p className="text-sm text-muted-foreground">No pending proposals sent.</p>;

  return (
    <div className="space-y-2">
      {action.dialog}
      {proposals.map((p) => (
        <div key={p.id} className="bento-cell p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              <Link href={assetHref("STARKNET", p.nftContract, p.tokenId)} className="hover:underline">View asset</Link>
            </p>
            <p className="text-xs text-muted-foreground">You proposed {p.amount}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={action.busy}
            onClick={() =>
              action.run(p.proposalId, (api) => api.intents.create("sponsorship-proposal-withdraw", { proposer: walletAddress, proposalId: p.proposalId }), () => mutate())
            }
          >
            <Spinner active={action.busy && action.activeId === p.proposalId} idle={null} className="mr-1.5" />
            Withdraw
          </Button>
        </div>
      ))}
    </div>
  );
}

function LicenseList({ loading, empty, children }: { loading: boolean; empty: string; children: React.ReactNode[] }) {
  if (loading) return <Skeleton className="h-16 w-full rounded-xl" />;
  if (children.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-2">{children}</div>;
}

export function PortfolioSponsorships() {
  const { walletAddress } = useMedialaneApp();
  const { offers } = useSponsorshipOffers(walletAddress ? { author: walletAddress, open: true } : undefined);
  const { licenses: held, isLoading: heldLoading } = useSponsorshipLicenses(walletAddress ? { holder: walletAddress } : undefined);
  const { licenses: issued, isLoading: issuedLoading } = useSponsorshipLicenses(walletAddress ? { author: walletAddress } : undefined);

  if (!walletAddress) return null;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2"><Handshake className="h-4 w-4 text-brand-rose" />Proposals awaiting your decision</h2>
        <ReceivedProposals walletAddress={walletAddress} />
      </section>

      {offers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold">Bids on your offers</h2>
          <div className="space-y-2">
            {offers.map((o) => <OfferBidsRow key={o.id} offer={o} />)}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold">Proposals you&apos;ve sent</h2>
        <SentProposals walletAddress={walletAddress} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold">Licenses you hold</h2>
        <LicenseList loading={heldLoading} empty="No sponsorship licenses yet.">
          {held.map((l) => (
            <div key={l.id} className="bento-cell p-4">
              <p className="text-sm font-semibold">
                <Link href={assetHref("STARKNET", l.assetContract, l.assetTokenId)} className="hover:underline">License on this asset</Link>
              </p>
              <p className="text-xs text-muted-foreground">from <AddressDisplay address={l.author} chars={4} showCopy={false} /></p>
            </div>
          ))}
        </LicenseList>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold">Licenses issued on your work</h2>
        <LicenseList loading={issuedLoading} empty="No licenses issued yet.">
          {issued.map((l) => (
            <div key={l.id} className="bento-cell p-4">
              <p className="text-sm font-semibold">
                <Link href={assetHref("STARKNET", l.assetContract, l.assetTokenId)} className="hover:underline">License on this asset</Link>
              </p>
              <p className="text-xs text-muted-foreground">held by <AddressDisplay address={l.currentHolder ?? l.recipient} chars={4} showCopy={false} /></p>
            </div>
          ))}
        </LicenseList>
      </section>
    </div>
  );
}
