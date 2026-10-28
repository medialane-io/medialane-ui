"use client";

import { useEffect, useState } from "react";
import { Handshake, ImageIcon, Loader2 } from "lucide-react";
import { formatAmount, getTokenByAddress, normalizeAddress } from "@medialane/sdk";
import { BackButton } from "./back-button.js";
import { Button } from "./button.js";
import Image from "./image.js";
import { Input } from "./input.js";
import { useMedialaneApp } from "./medialane-app.js";
import { FadeIn } from "./motion-primitives.js";
import { RewardEarned } from "./rewards/reward-earned.js";
import { ServiceHeader } from "./service-header.js";
import { TransactionDialog } from "./transaction-dialog.js";
import { TransactionSuccess } from "./transaction-success.js";
import { shortenAddress } from "../utils/address.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useSponsorshipBids, useSponsorshipOffer } from "../utils/use-sponsorship.js";
import { useToken } from "../utils/use-tokens.js";
import { useTransaction } from "../utils/use-transaction.js";
import { successMessages } from "../utils/success-messages.js";

type Action = "bid" | "accept";

const COPY = {
  bid: { title: "Place bid", working: "Placing your bid…", message: successMessages.bidPlaced() },
  accept: { title: "Accept bid", working: "Accepting the bid…", message: successMessages.bidAccepted() },
} as const;

export function SponsorshipOfferPage({ offerId }: { offerId: string }) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const resolveImage = useImageUrl();
  const { offer, isLoading, mutate: mutateOffer } = useSponsorshipOffer(offerId);
  const { bids, isLoading: bidsLoading, mutate: mutateBids } = useSponsorshipBids(offerId);
  const { token } = useToken(offer?.nftContract ?? "", offer?.tokenId ?? "");
  const tx = useTransaction();
  const [action, setAction] = useState<Action>("bid");
  const [amount, setAmount] = useState("");
  const [activeSponsor, setActiveSponsor] = useState<string | null>(null);

  useEffect(() => {
    if (tx.phase !== "success") return;
    setAmount("");
    void Promise.all([mutateOffer(), mutateBids()]);
  }, [tx.phase, mutateOffer, mutateBids]);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 pt-24 pb-8 text-center text-sm text-muted-foreground">Loading offer…</div>;
  }
  if (!offer) {
    return <div className="max-w-3xl mx-auto px-4 pt-24 pb-8 text-center text-sm text-muted-foreground">Offer not found.</div>;
  }

  const isOwner = !!walletAddress && normalizeAddress("STARKNET", walletAddress) === normalizeAddress("STARKNET", offer.author);
  const paymentToken = getTokenByAddress(offer.paymentToken);
  const busy = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";
  const name = token?.metadata?.name ?? `Token #${offer.tokenId}`;
  const imageUrl = resolveImage(token?.metadata?.image);
  const minDisplay = paymentToken ? `${formatAmount(offer.minAmount, paymentToken.decimals)} ${paymentToken.symbol}` : offer.minAmount;
  const format = (value: string) => (paymentToken ? `${formatAmount(value, paymentToken.decimals)} ${paymentToken.symbol}` : value);

  const placeBid = () => {
    if (!walletAddress || !paymentToken) return;
    setAction("bid");
    void tx.run(async (signer) => {
      const value = BigInt(Math.round(Number(amount) * 10 ** paymentToken.decimals));
      await runIntentCalls(signer, () =>
        app.getClient().api.intents.create("sponsorship-bid", { sponsor: walletAddress, offerId: offer.offerId, amount: value.toString(), paymentToken: offer.paymentToken }),
      );
    });
  };

  const acceptBid = (sponsor: string) => {
    if (!walletAddress) return;
    setAction("accept");
    setActiveSponsor(sponsor);
    void tx
      .run(async (signer) => {
        await runIntentCalls(signer, () =>
          app.getClient().api.intents.create("sponsorship-bid-accept", { author: walletAddress, offerId: offer.offerId, sponsor }),
        );
      })
      .finally(() => setActiveSponsor(null));
  };

  const copy = COPY[action];

  return (
    <div className="pb-16">
      <TransactionDialog tx={tx} title={copy.title} workingLabel={copy.working} firstStepLabel="Prepare">
        <TransactionSuccess
          name={name}
          {...copy.message}
          txHash={tx.txHash}
          actions={[{ label: "Done", onClick: tx.reset }]}
        >
          {action === "bid" && <RewardEarned actionType="place_sponsorship_bid" />}
        </TransactionSuccess>
      </TransactionDialog>

      <section className="px-4 pt-10 max-w-3xl mx-auto space-y-6">
        <BackButton fallbackHref="/launchpad/sponsorship" />
        <FadeIn>
          <ServiceHeader plain icon={<Handshake className="h-4 w-4 text-white" />} title={name} subtitle={offer.open ? "Open for bids" : "Closed"} />
        </FadeIn>

        <FadeIn>
          <div className="rounded-2xl border border-border/40 overflow-hidden">
            <div className="relative aspect-square bg-muted/40">
              {imageUrl ? (
                <Image src={imageUrl} alt={name} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" unoptimized />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Minimum bid</p>
                <p className="font-semibold">{minDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">License length</p>
                <p className="font-semibold">{Math.round(Number(offer.duration) / 86400)} days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resale royalty</p>
                <p className="font-semibold">{(offer.royaltyBps / 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="font-semibold">{shortenAddress(offer.author)}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {!offer.open ? (
          <FadeIn>
            <p className="text-sm text-muted-foreground text-center py-6">This offer is no longer open.</p>
          </FadeIn>
        ) : isOwner ? (
          <FadeIn>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Bids</p>
              {bidsLoading ? (
                <p className="text-xs text-muted-foreground">Loading bids…</p>
              ) : bids.length === 0 ? (
                <p className="text-xs text-muted-foreground">No bids yet.</p>
              ) : (
                <div className="space-y-2">
                  {bids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/30 p-3">
                      <div>
                        <p className="text-sm font-medium">{shortenAddress(bid.sponsor)}</p>
                        <p className="text-xs text-muted-foreground">{format(bid.amount)}</p>
                      </div>
                      <Button size="sm" className="bg-brand-rose hover:brightness-110 text-white" disabled={busy} onClick={() => acceptBid(bid.sponsor)}>
                        {busy && activeSponsor === bid.sponsor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Accept"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Place a bid</p>
              <div className="flex gap-2">
                <Input type="number" min={0} step="0.01" placeholder="Your bid" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} />
                <Button className="bg-brand-rose hover:brightness-110 text-white shrink-0" disabled={busy || !walletAddress || !paymentToken || !amount || Number(amount) <= 0} onClick={placeBid}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place bid"}
                </Button>
              </div>
              {!walletAddress && (
                <button type="button" className="text-xs text-muted-foreground underline" onClick={app.onRequireWallet}>
                  {app.connectLabel ?? "Connect"} to place a bid
                </button>
              )}
              {!paymentToken && <p className="text-xs text-destructive">This offer uses a currency the app does not support yet.</p>}
              <p className="text-xs text-muted-foreground">
                Placing a bid approves the offer&apos;s payment token — no funds move until the owner accepts.
              </p>
            </div>
          </FadeIn>
        )}
      </section>
    </div>
  );
}
