"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Handshake, Loader2, X } from "lucide-react";
import { SUPPORTED_TOKENS, getTokenBySymbol } from "@medialane/sdk";
import { Button } from "../button.js";
import { AssetPicker, type OwnedAsset } from "../asset-picker.js";
import { AssetSearchPicker } from "../asset-search-picker.js";
import { LicenseTermsBuilder, EMPTY_SPONSORSHIP_TERMS, toDurationDays, toLicenseMetadata, type SponsorshipTerms } from "../license-terms-builder.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
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
import { useT } from "../../i18n/provider.js";
import { msg } from "../../i18n/translate.js";
import { ActionButton } from "../action-button.js";

type Mode = "offer" | "propose";

const TOKEN_SYMBOLS = SUPPORTED_TOKENS.filter((t) => t.listable).map((t) => t.symbol);

function PendingProposalsPanel({ nftContract }: { nftContract: string }) {
  const t = useT();
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
    <div className="panel p-4 space-y-3">
      <p className="text-sm font-semibold">{t("Pending proposals")}</p>
      {proposals.map((p) => (
        <div key={p.proposalId} className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-muted-foreground">{shortenAddress(p.proposer)} — {p.amount}</span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="soft" disabled={busy} onClick={() => respond(p.proposalId, "reject")}>
              {busy && activeId === p.proposalId ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              {t("Decline")}
            </Button>
            <ActionButton small disabled={busy} onClick={() => respond(p.proposalId, "accept")}>
              {busy && activeId === p.proposalId ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              {t("Accept")}
            </ActionButton>
          </div>
        </div>
      ))}
      {tx.phase === "error" && (
        <div className="flex items-center gap-2 text-xs text-destructive" role="alert">
          <AlertCircle className="h-3.5 w-3.5" />
          {tx.error}
          <button type="button" className="underline" onClick={tx.reset}>{t("Dismiss")}</button>
        </div>
      )}
    </div>
  );
}

export function SponsorshipCreate({ aside }: { aside?: ReactNode }) {
  const t = useT();
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
    if (!walletAddress) return setFormError(msg("Refresh to continue."));
    if (!chosen) return setFormError(mode === "offer" ? msg("Choose the work to offer.") : msg("Pick the work to sponsor."));
    if (!terms.amount || Number(terms.amount) <= 0) return setFormError(msg("Add an amount before continuing."));
    const token = getTokenBySymbol(terms.paymentTokenSymbol);
    if (!token) return setFormError(msg("Pick a currency."));
    const durationDays = toDurationDays(terms);
    if (!durationDays) return setFormError(msg("Choose how long the license should last."));

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
      title={t("Secure your account to set up a sponsorship")}
      description={t("Secure your account to continue.")}
    >
      <ClaimRouteShell
        icon={<Handshake className="h-4 w-4 text-white" />}
        title={t("Set up a sponsorship")}
        subtitle={t("Sponsor a work or open one to sponsors.")}
        aside={aside}
      >
        <div className="space-y-6">
          <div className="inline-flex rounded-full p-1 bg-background/40">
            {(["offer", "propose"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  mode === m
                    ? "px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
                    : "px-4 py-1.5 rounded-full text-sm font-semibold text-muted-foreground"
                }
              >
                {m === "offer" ? t("Offer my work") : t("Propose to sponsor")}
              </button>
            ))}
          </div>

          {mode === "offer" ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">{t("Pick a work you own")}</p>
              <AssetPicker
                assets={ownedAssets}
                isLoading={assetsLoading}
                selected={selectedAsset}
                onSelect={setSelectedAsset}
                emptyStateHref="/launchpad/single-editions"
                emptyStateLabel={t("Create one")}
              />
              {selectedAsset ? <PendingProposalsPanel nftContract={selectedAsset.contractAddress} /> : null}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold">{t("Which work do you want to sponsor?")}</p>
              <AssetSearchPicker search={searchAssets} selected={proposeAsset} onSelect={setProposeAsset} placeholder={t("Search by title or creator")} />
            </div>
          )}

          <div className="pt-2 border-t border-border/30">
            <LicenseTermsBuilder
              value={terms}
              onChange={setTerms}
              tokenOptions={TOKEN_SYMBOLS}
              amountLabel={mode === "offer" ? t("Minimum accepted bid") : t("Amount you'll pay")}
              disabled={busy}
            />
          </div>

          {formError && <p role="alert" className="text-sm text-destructive">{t(formError)}</p>}

          <ActionButton solid big type="button" disabled={busy} onClick={onSubmit} icon={<Handshake className="h-4 w-4" />} className="w-full">
            {mode === "offer" ? t("Create offer") : t("Send proposal")}
          </ActionButton>
        </div>
      </ClaimRouteShell>

      <TransactionDialog
        tx={tx}
        title={mode === "offer" ? t("Create sponsorship offer") : t("Send proposal")}
        workingLabel={mode === "offer" ? t("Creating your sponsorship offer…") : t("Sending your proposal…")}
        firstStepLabel={t("Saving the terms")}
      >
        <TransactionSuccess
          name={chosen?.name ?? t("Your sponsorship")}
          image={chosen?.image ?? null}
          title={mode === "offer" ? t("Offer created") : t("Proposal sent")}
          description={
            mode === "offer"
              ? t("Your offer is saved with the work and terms you chose.")
              : t("Your proposal is saved.")
          }
          actions={[{ href: "/launchpad/sponsorship", label: t("Back to Sponsorship launchpad") }, { label: t("Create another"), onClick: handleAgain }]}
        >
          {mode === "offer" && <RewardEarned actionType="create_sponsorship_offer" />}
        </TransactionSuccess>
      </TransactionDialog>
    </WalletRequired>
  );
}
