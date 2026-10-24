"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Handshake, Loader2, X } from "lucide-react";
import { SUPPORTED_TOKENS, getTokenBySymbol } from "@medialane/sdk";
import { Button } from "../button.js";
import { AssetPicker, type OwnedAsset } from "../asset-picker.js";
import { AssetSearchPicker } from "../asset-search-picker.js";
import { LicenseTermsBuilder, EMPTY_SPONSORSHIP_TERMS, toDurationDays, toLicenseMetadata, type SponsorshipTerms } from "../license-terms-builder.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { CreationSuccess } from "../creation-success.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { uploadJsonToIpfs } from "../../utils/ipfs-upload.js";
import { useImageUrl } from "../../utils/use-image-url.js";
import { useTokensByOwner } from "../../utils/use-tokens.js";
import { usePendingProposalsForAsset } from "../../utils/use-sponsorship.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { shortenAddress } from "../../utils/address.js";

type Mode = "offer" | "propose";

const TOKEN_SYMBOLS = SUPPORTED_TOKENS.filter((t) => t.listable).map((t) => t.symbol);

function PendingProposalsPanel({ nftContract }: { nftContract: string }) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const { proposals, isLoading, mutate } = usePendingProposalsForAsset(nftContract);
  const tx = useTransaction();
  const [activeId, setActiveId] = useState<string | null>(null);
  const busy = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  const respond = (proposalId: string, decision: "accept" | "reject") => {
    if (!walletAddress) return;
    setActiveId(proposalId);
    void tx
      .run(async (signer) => {
        const api = app.getClient().api;
        await runIntentCalls(signer, () =>
          decision === "accept"
            ? api.intents.create("sponsorship-proposal-accept", { owner: walletAddress, proposalId })
            : api.intents.create("sponsorship-proposal-reject", { owner: walletAddress, proposalId }),
        );
        await mutate();
      })
      .finally(() => setActiveId(null));
  };

  if (isLoading || proposals.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold">Pending proposals</p>
      {proposals.map((p) => (
        <div key={p.proposalId} className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-muted-foreground">{shortenAddress(p.proposer)} — {p.amount}</span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => respond(p.proposalId, "reject")}>
              {busy && activeId === p.proposalId ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              Decline
            </Button>
            <Button size="sm" className="bg-brand-rose hover:brightness-110 text-white" disabled={busy} onClick={() => respond(p.proposalId, "accept")}>
              {busy && activeId === p.proposalId ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Accept
            </Button>
          </div>
        </div>
      ))}
      {tx.phase === "error" && (
        <div className="flex items-center gap-2 text-xs text-destructive" role="alert">
          <AlertCircle className="h-3.5 w-3.5" />
          {tx.error}
          <button type="button" className="underline" onClick={tx.reset}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export function SponsorshipCreate({ aside }: { aside?: ReactNode }) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const resolveImage = useImageUrl();
  const tx = useTransaction();
  const [formError, setFormError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("propose");
  const [selectedAsset, setSelectedAsset] = useState<OwnedAsset | null>(null);
  const [proposeAsset, setProposeAsset] = useState<OwnedAsset | null>(null);
  const [terms, setTerms] = useState<SponsorshipTerms>({ ...EMPTY_SPONSORSHIP_TERMS, paymentTokenSymbol: "USDC" });
  const busy = tx.phase !== "idle";

  const { tokens: ownedTokens, isLoading: assetsLoading } = useTokensByOwner(walletAddress ?? null, 1, 100);
  const ownedAssets: OwnedAsset[] = ownedTokens.map((t) => ({
    contractAddress: t.contractAddress,
    tokenId: t.tokenId,
    name: t.metadata?.name ?? `Token #${t.tokenId}`,
    image: resolveImage(t.metadata?.image),
  }));

  const searchAssets = async (query: string): Promise<OwnedAsset[]> => {
    const res = await app.getClient().api.search(query, 16);
    return res.data.tokens.map((t) => ({
      contractAddress: t.contractAddress,
      tokenId: t.tokenId,
      name: t.name ?? `Token #${t.tokenId}`,
      image: resolveImage(t.image),
    }));
  };

  const chosen = mode === "offer" ? selectedAsset : proposeAsset;

  const onSubmit = () => {
    setFormError(null);
    if (!walletAddress) return setFormError("Your account isn't ready yet. Refresh the page and try again.");
    if (!chosen) return setFormError(mode === "offer" ? "Choose which asset you're offering." : "Search for the asset you want to sponsor, then pick it.");
    if (!terms.amount || Number(terms.amount) <= 0) return setFormError("Add an amount before continuing.");
    const token = getTokenBySymbol(terms.paymentTokenSymbol);
    if (!token) return setFormError("Pick a currency.");
    const durationDays = toDurationDays(terms);
    if (!durationDays) return setFormError("Choose how long the license should last.");

    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const licenseTermsUri = await uploadJsonToIpfs(api, toLicenseMetadata(terms));
      const amount = BigInt(Math.round(Number(terms.amount) * 10 ** token.decimals)).toString();
      const duration = durationDays * 86400;
      const royaltyBps = Math.round(Number(terms.royaltyPercent || "0") * 100);
      await runIntentCalls(signer, () =>
        mode === "offer"
          ? api.intents.create("sponsorship-offer", {
              author: walletAddress, nftContract: chosen.contractAddress, tokenId: chosen.tokenId, minAmount: amount,
              duration, paymentToken: token.address, licenseTermsUri, transferable: terms.transferable, royaltyBps,
            })
          : api.intents.create("sponsorship-proposal", {
              proposer: walletAddress, nftContract: chosen.contractAddress, tokenId: chosen.tokenId, amount,
              duration, paymentToken: token.address, licenseTermsUri, transferable: terms.transferable, royaltyBps,
            }),
      );
    });
  };

  const handleAgain = () => {
    tx.reset();
    setSelectedAsset(null);
    setProposeAsset(null);
    setTerms({ ...EMPTY_SPONSORSHIP_TERMS, paymentTokenSymbol: "USDC" });
  };

  return (
    <WalletRequired
      icon={Handshake}
      iconClassName="text-brand-rose"
      title="Secure your account to set up a sponsorship"
      description="Secure your account to publish onchain."
    >
      <ClaimRouteShell
        icon={<Handshake className="h-4 w-4 text-white" />}
        title="Set up a sponsorship"
        subtitle="Found IP you'd like to back? Propose terms directly to its owner. Own something worth sponsoring? Post it and let sponsors bid."
        aside={aside}
      >
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-border p-1 bg-card">
            {(["offer", "propose"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  mode === m
                    ? "px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-purple to-brand-blue text-white"
                    : "px-4 py-1.5 rounded-full text-sm font-semibold text-muted-foreground"
                }
              >
                {m === "offer" ? "Offer my asset" : "Propose to sponsor"}
              </button>
            ))}
          </div>

          {mode === "offer" ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Pick an asset you own</p>
              <AssetPicker
                assets={ownedAssets}
                isLoading={assetsLoading}
                selected={selectedAsset}
                onSelect={setSelectedAsset}
                emptyStateHref="/launchpad/single-editions"
                emptyStateLabel="Create one"
              />
              {selectedAsset ? <PendingProposalsPanel nftContract={selectedAsset.contractAddress} /> : null}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Which asset do you want to sponsor?</p>
              <AssetSearchPicker search={searchAssets} selected={proposeAsset} onSelect={setProposeAsset} placeholder="Search by asset name or creator" />
            </div>
          )}

          <div className="pt-2 border-t border-border/30">
            <LicenseTermsBuilder
              value={terms}
              onChange={setTerms}
              tokenOptions={TOKEN_SYMBOLS}
              amountLabel={mode === "offer" ? "Minimum accepted bid" : "Amount you'll pay"}
              disabled={busy}
            />
          </div>

          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}

          <div className="btn-border-animated p-[1px] rounded-2xl">
            <button
              type="button"
              disabled={busy}
              onClick={onSubmit}
              className="w-full h-12 rounded-[15px] flex items-center justify-center gap-2 text-base font-semibold text-white bg-transparent transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              <Handshake className="h-4 w-4" />
              {mode === "offer" ? "Create Offer" : "Send proposal"}
            </button>
          </div>
        </div>
      </ClaimRouteShell>

      <TransactionDialog
        tx={tx}
        title={mode === "offer" ? "Create sponsorship offer" : "Send proposal"}
        workingLabel={mode === "offer" ? "Creating your sponsorship offer…" : "Sending your proposal…"}
        firstStepLabel="Upload license terms"
      >
        <CreationSuccess
          name={chosen?.name ?? "Your sponsorship"}
          image={chosen?.image ?? null}
          caption={mode === "offer" ? "Your offer is live" : "Your proposal is sent"}
          primary={{ href: "/launchpad/sponsorship", label: "Back to Sponsorship launchpad" }}
          onAgain={handleAgain}
          againLabel="Create another"
        >
          {mode === "offer" && <RewardEarned actionType="create_sponsorship_offer" />}
        </CreationSuccess>
      </TransactionDialog>
    </WalletRequired>
  );
}
