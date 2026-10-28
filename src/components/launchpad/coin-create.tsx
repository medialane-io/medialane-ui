"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Coins, ImagePlus, Loader2, X } from "lucide-react";
import { SUPPORTED_TOKENS, formatAmount, getTokenBySymbol, normalizeAddress } from "@medialane/sdk";
import { acceptFor } from "../../utils/upload-limits.js";
import {
  SUGGESTED_DEFAULT_PRICE,
  buybackQuoteRaw,
  coinToRaw as toRaw,
  fdvHuman,
  parseCreatorCoinCreated,
  teamCoinsRaw,
  validateCoinName as validateName,
  validateCoinSupply as validateSupply,
  validateCoinSymbol as validateSymbol,
  validatePrice,
  assertTransactionSucceeded,
  type CreatorCoinReceiptLike,
} from "@medialane/sdk/starknet";
import Image from "../image.js";
import Link from "../link.js";
import { Input } from "../input.js";
import { Label } from "../label.js";
import { Textarea } from "../textarea.js";
import { CoinLaunchPreview, type CoinPreviewData } from "../coin-launch-preview.js";
import { CurrencyAmount, CurrencyIcon } from "../currency-icon.js";
import { GradientButton } from "../gradient-button.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { cn } from "../../utils/cn.js";
import { suggestLaunchpadSymbol } from "../../utils/launchpad-defaults.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useLaunchpadImageUpload } from "../../utils/use-launchpad-image-upload.js";
import { useTokenBalance } from "../../utils/media-wallet/use-erc20-balance.js";

const QUOTE_OPTIONS = SUPPORTED_TOKENS.map((t) => t.symbol);
type Quote = (typeof QUOTE_OPTIONS)[number];

const SUPPLY_PRESETS = [
  { label: "1M", value: "1000000" },
  { label: "100M", value: "100000000" },
  { label: "1B", value: "1000000000" },
];

type ProfileStatus = "idle" | "saving" | "saved" | "failed";

export interface CoinCreateProps {
  aside?: ReactNode;
  tradeHref: (coinAddress: string) => string;
}

export function CoinCreate({ aside, tradeHref }: CoinCreateProps) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [autoSymbol, setAutoSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [supply, setSupply] = useState("");
  const [quote, setQuote] = useState<Quote>("STRK");
  const [price, setPrice] = useState(String(SUGGESTED_DEFAULT_PRICE));
  const [teamPct, setTeamPct] = useState(5);
  const [coinAddress, setCoinAddress] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("idle");

  const upload = useLaunchpadImageUpload({ successMessage: "Image ready" });
  const { imagePreview, imageUri, imageUploading, uploadError, uploadSuccess, fileInputRef, handleImageSelect, clearImage } = upload;

  const quoteToken = getTokenBySymbol(quote)!;
  const { rawBalance } = useTokenBalance(quote, walletAddress ?? null);

  const priceNum = Number(price);
  const nameErr = name ? validateName(name) : null;
  const symErr = symbol ? validateSymbol(symbol) : null;
  const supplyErr = supply ? validateSupply(supply) : null;
  const priceErr = price ? validatePrice(quoteToken.decimals, priceNum) : "Price is required";
  const identityValid = !validateName(name) && !validateSymbol(symbol);
  const economicsValid = !validateSupply(supply) && !priceErr;

  const handleNameChange = (v: string) => {
    setName(v);
    const suggested = suggestLaunchpadSymbol(v);
    if (suggested && (!symbol || symbol === autoSymbol)) {
      setSymbol(suggested);
      setAutoSymbol(suggested);
    }
  };

  const preview = useMemo(() => {
    if (validateSupply(supply) || validatePrice(quoteToken.decimals, priceNum)) return null;
    const supplyHuman = Number(supply);
    const supplyRaw = toRaw(BigInt(supply));
    const teamRaw = teamCoinsRaw(supplyRaw, teamPct);
    const buybackRaw = buybackQuoteRaw(teamRaw, priceNum, quoteToken.decimals);
    return {
      fdv: fdvHuman(supplyHuman, priceNum),
      teamCoins: supplyHuman * (teamPct / 100),
      buybackRaw,
      buybackHuman: formatAmount(buybackRaw.toString(), quoteToken.decimals),
    };
  }, [supply, priceNum, teamPct, quoteToken.decimals]);

  const insufficient = preview != null && rawBalance != null && rawBalance < preview.buybackRaw;
  const canLaunch = identityValid && economicsValid && preview != null && teamPct > 0 && !insufficient && !imageUploading;

  const previewData: CoinPreviewData = {
    name,
    symbol,
    description,
    imageUrl: imagePreview,
    supplyHuman: economicsValid && supply ? Number(supply) : null,
    price: priceErr ? SUGGESTED_DEFAULT_PRICE : priceNum,
    quoteSymbol: quote,
    teamPct,
  };

  const handleLaunchClick = () => {
    if (!canLaunch || !walletAddress || !preview) return;
    const owner = normalizeAddress("STARKNET", walletAddress);
    const supplyRaw = toRaw(BigInt(supply));
    const teamRaw = teamCoinsRaw(supplyRaw, teamPct);
    const buybackRaw = buybackQuoteRaw(teamRaw, priceNum, quoteToken.decimals);
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const client = app.getClient();
      const api = client.api;

      const { txHash: deployHash } = await runIntentCalls(signer, () =>
        api.intents.create("create-coin", { owner, name, symbol, initialSupply: supplyRaw.toString() }),
      );
      const deployReceipt = await assertTransactionSucceeded(client.provider, deployHash);
      const address = parseCreatorCoinCreated(deployReceipt as CreatorCoinReceiptLike);

      await runIntentCalls(signer, () =>
        api.intents.create("launch-coin", {
          owner,
          creatorCoin: address,
          quoteToken: quoteToken.address,
          price: priceNum,
          initialHolders: teamPct > 0 ? [owner] : [],
          initialHoldersAmounts: teamPct > 0 ? [teamRaw.toString()] : [],
          transferRestrictionDelay: 0,
          quoteFundAmount: buybackRaw.toString(),
        }),
      );
      await api.coins.sync(address, owner).catch(() => {});
      setCoinAddress(address);

      if (imageUri || description) {
        setProfileStatus("saving");
        await api.collections
          .updateProfile(address, { ...(imageUri ? { image: imageUri } : {}), ...(description ? { description } : {}) })
          .then(() => setProfileStatus("saved"))
          .catch(() => setProfileStatus("failed"));
      }
    });
  };

  const handleReset = () => {
    tx.reset();
    setCoinAddress(null);
    setProfileStatus("idle");
    setName("");
    setSymbol("");
    setAutoSymbol("");
    setDescription("");
    setSupply("");
    setPrice(String(SUGGESTED_DEFAULT_PRICE));
    setTeamPct(5);
    clearImage();
  };

  return (
    <WalletRequired
      icon={Coins}
      iconClassName="text-brand-orange"
      title="Launch a Creator Coin"
      description="Secure your account to design and launch your own coin with permanently-locked liquidity, in a few clicks."
    >
      <TransactionDialog tx={tx} title="Launch your coin" workingLabel="Launching your coin…" firstStepLabel="Deploy your coin">
        <TransactionSuccess
          name={name || "Your coin"}
          image={imagePreview}
          title="Coin launched"
          description="The supply is fixed and the liquidity is locked."
          actions={[
            ...(coinAddress ? [{ href: tradeHref(coinAddress), label: "View & trade your coin" }] : []),
            { href: "/launchpad", label: "Back to Launchpad" },
            { label: "Launch another coin", onClick: handleReset },
          ]}
        >
          {profileStatus === "saving" && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving your coin&apos;s image &amp; description…
            </p>
          )}
          {profileStatus === "failed" && (
            <p className="text-xs text-muted-foreground text-center">
              Couldn&apos;t save the image &amp; description right now. Add them anytime from your collection settings.
            </p>
          )}
          <RewardEarned actionType="launch_coin" />
        </TransactionSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<Coins className="h-4 w-4 text-white" />}
        title="Design your Creator Coin"
        subtitle="A few steps to design and launch your coin."
        aside={
          <>
            <CoinLaunchPreview data={previewData} />
            {aside}
          </>
        }
      >
        <div className="space-y-7">

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Give it a face</h3>
            </div>

              <div className="space-y-1.5">
                <Label>Coin image</Label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative h-24 w-24 shrink-0 rounded-full overflow-hidden border border-dashed border-border bg-muted/20 flex items-center justify-center"
                  >
                    {imagePreview ? (

                      <Image src={imagePreview} alt="Coin" fill unoptimized className="object-cover" />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    )}
                    {imageUploading && (
                      <span className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </span>
                    )}
                  </button>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>JPG, PNG, GIF, SVG or WebP</p>
                    {imagePreview && (
                      <button type="button" onClick={clearImage} className="inline-flex items-center gap-1 text-muted-foreground active:text-foreground">
                        <X className="h-3 w-3" /> Remove
                      </button>
                    )}
                    {uploadError && <p className="text-destructive">{uploadError}</p>}
                    {uploadSuccess && <p className="text-emerald-500">✓ {uploadSuccess}</p>}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptFor("image")}
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageSelect(f); }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="My Coin" />
                  {nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="COIN" />
                  {symErr && <p className="text-xs text-destructive">{symErr}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Tell your community what this coin is about…"
                  rows={3}
                />
              </div>

          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Set the numbers</h3>
            </div>
              <div className="space-y-1.5">
                <Label htmlFor="supply">Total supply</Label>
                <div className="flex gap-2 mb-1">
                  {SUPPLY_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSupply(p.value)}
                      className={cn(
                        "rounded-lg border px-3.5 py-1.5 text-sm font-medium",
                        supply === p.value ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-border text-muted-foreground",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    id="supply" inputMode="numeric"
                    value={supply ? Number(supply).toLocaleString() : ""}
                    onChange={(e) => setSupply(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="1,000,000"
                    className="pr-16 text-lg font-semibold tabular-nums"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    coins
                  </span>
                </div>
                {supplyErr && <p className="text-xs text-destructive">{supplyErr}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Pair</Label>
                <div className="flex gap-2 flex-wrap">
                  {QUOTE_OPTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuote(q)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium",
                        quote === q ? "border-brand-maeve bg-brand-maeve/10 text-brand-maeve" : "border-border text-muted-foreground",
                      )}
                    >
                      <CurrencyIcon symbol={q} size={16} />
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Price ({quote} per coin)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <CurrencyIcon symbol={quote} size={16} />
                  </span>
                  <Input
                    id="price" inputMode="decimal" value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder={String(SUGGESTED_DEFAULT_PRICE)}
                    className="pl-9"
                  />
                </div>
                {priceErr && price && <p className="text-xs text-destructive">{priceErr}</p>}
              </div>

              {preview && (
                <div className="rounded-xl bg-muted/50 dark:bg-muted/30 p-4">
                  <p className="text-2xs uppercase tracking-wide text-muted-foreground">Starting market cap</p>
                  <p className="text-2xl font-bold tabular-nums text-brand-maeve">
                    <CurrencyAmount amount={preview.fdv.toLocaleString()} symbol={quote} iconSize={18} />
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="alloc">Your allocation: {teamPct}%</Label>
                <input
                  id="alloc" type="range" min={1} max={10} step={1}
                  value={teamPct} onChange={(e) => setTeamPct(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--brand-orange))]"
                />
                {preview && (
                  <p className={cn("text-sm font-semibold", insufficient ? "text-destructive" : "text-foreground")}>
                    <CurrencyAmount amount={preview.buybackHuman} symbol={quote} iconSize={14} /> required
                  </p>
                )}
                {insufficient && (
                  <p className="text-xs text-destructive">
                    Your wallet doesn&apos;t have enough {quote}. Add funds, or adjust the numbers above.
                  </p>
                )}
              </div>

          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-4">
              <GradientButton
                big
                onClick={handleLaunchClick}
                disabled={!canLaunch || tx.phase !== "idle"}
                className={!canLaunch || tx.phase !== "idle" ? "opacity-40 pointer-events-none" : ""}
              >
                {tx.phase !== "idle" ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Launching…</> : <>Launch your coin <ArrowRight className="h-4 w-4 ml-1.5" /></>}
              </GradientButton>
              <p className="text-xs text-muted-foreground text-center">
                <Link href="/claim/memecoin" className="underline active:text-foreground">
                  Already launched a coin? Claim it instead.
                </Link>
              </p>
          </section>
        </div>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
