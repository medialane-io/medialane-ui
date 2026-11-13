"use client";

import { forwardRef, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import Image from "./image.js";
import { AlertCircle, ExternalLink, Loader2, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "./alert.js";
import { Button } from "./button.js";
import { CurrencyIcon } from "./currency-icon.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { cn } from "../utils/cn.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";

interface MarketplaceTxLinkProps {
  txHash: string;
  explorerUrl: string;
  className?: string;
}

export function MarketplaceTxLink({ txHash, explorerUrl, className }: MarketplaceTxLinkProps) {
  return (
    <a
      href={`${explorerUrl}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <span className="tabular-nums">{txHash.slice(0, 10)}…{txHash.slice(-8)}</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

interface MarketplaceProcessingStateProps {
  title: string;
  description?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  txHash?: string | null;
  explorerUrl?: string;
}

export function MarketplaceProcessingState({
  title,
  description = "Keep this window open until it finishes.",
  imageUrl,
  imageAlt = "Token preview",
  txHash,
  explorerUrl,
}: MarketplaceProcessingStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 p-6 py-8">
      {imageUrl ? (
        <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-border">
          <Image src={imageUrl} alt={imageAlt} fill sizes="80px" className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        </div>
      ) : (
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      )}
      <div className="text-center space-y-1">
        <p className="font-semibold">{title}</p>
        {txHash && explorerUrl ? (
          <MarketplaceTxLink txHash={txHash} explorerUrl={explorerUrl} className="mt-1" />
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface MarketplaceSignInGateProps {
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
}

export function MarketplaceSignInGate({ title, description, href, ctaLabel = "Set up account" }: MarketplaceSignInGateProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 py-10 text-center">
      <Wallet className="h-10 w-10 text-muted-foreground" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="btn-border-animated w-full p-[1px] rounded-lg">
        <Button
          asChild
          className="w-full bg-transparent text-white rounded-[7px] hover:bg-transparent hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <a href={href}>{ctaLabel}</a>
        </Button>
      </div>
    </div>
  );
}

interface MarketplaceErrorStateProps {
  tokenImage?: string | null;
  name: string;
  title: string;
  description: ReactNode;
  error?: string | null;
  txHash?: string | null;
  explorerUrl: string;
  onRetry?: () => void;
  onDone: () => void;
  doneLabel?: string;
}

export function MarketplaceErrorState({
  tokenImage,
  name,
  title,
  description,
  error,
  txHash,
  explorerUrl,
  onRetry,
  onDone,
  doneLabel = "Done",
}: MarketplaceErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 p-6 py-8">
      {tokenImage ? (
        <div className="relative">
          <div className="relative h-32 w-32 rounded-2xl overflow-hidden">
            <Image src={tokenImage} alt={name} fill sizes="128px" className="object-cover" unoptimized />
          </div>
          <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-destructive flex items-center justify-center border-2 border-background">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
        </div>
      ) : (
        <div className="h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center">
          <AlertCircle className="h-9 w-9 text-destructive" />
        </div>
      )}
      <div className="text-center space-y-1 max-w-full">
        <p className="font-bold text-xl break-words">{title}</p>
        <p className="text-sm text-muted-foreground break-words">{description}</p>
      </div>
      {error ? (
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {txHash && <MarketplaceTxLink txHash={txHash} explorerUrl={explorerUrl} />}
      <div className="flex w-full gap-2">
        {onRetry ? (
          <Button variant="outline" className="flex-1 h-11" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        <Button className="flex-1 h-11" onClick={onDone}>{doneLabel}</Button>
      </div>
    </div>
  );
}

interface MarketplaceDialogHeroProps {
  tokenImage?: string | null;
  tokenName?: string;
  tokenId: string;
  fallbackIcon: ReactNode;
  badge?: ReactNode;
}

export function MarketplaceDialogHero({
  tokenImage,
  tokenName,
  tokenId,
  fallbackIcon,
  badge,
}: MarketplaceDialogHeroProps) {
  const name = tokenName || `Token #${tokenId}`;

  return (
    <div className="relative flex justify-center pt-6 shrink-0">
      <div className="relative h-32 w-32 rounded-2xl overflow-hidden bg-muted">
        {tokenImage ? (
          <Image src={tokenImage} alt={name} fill sizes="128px" className="object-cover" unoptimized />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-blue/20 via-brand-purple/10 to-transparent flex items-center justify-center">
            {fallbackIcon}
          </div>
        )}
      </div>
      {badge}
    </div>
  );
}

interface OrderSummaryHeroProps {
  name: string;
  image?: string | null;
  subtitle?: ReactNode;
  tone?: "default" | "destructive";
  price?: { formatted: string | null; currency: string | null; decimals: number } | null;
  quantity?: number;
  usdTotal?: string | null;
}

export function OrderSummaryHero({
  name,
  image,
  subtitle,
  tone = "default",
  price: rawPrice,
  quantity = 1,
  usdTotal,
}: OrderSummaryHeroProps) {
  const price = rawPrice?.formatted && rawPrice.currency
    ? { formatted: rawPrice.formatted, currency: rawPrice.currency, decimals: rawPrice.decimals }
    : null;
  const unit = price ? parseFloat(price.formatted) : null;
  const showTotal = unit !== null && quantity > 1;
  const crypto = price
    ? formatDisplayPrice(showTotal ? (unit! * quantity).toFixed(price.decimals <= 6 ? 2 : 4) : price.formatted)
    : "";
  const stable = price ? isStableCurrency(price.currency) : false;
  const face = "font-[family-name:var(--font-display)] font-extrabold tracking-tight tabular-nums";

  return (
    <div>
      <div className="flex justify-center pt-6 shrink-0">
        <div className="relative h-32 w-32 rounded-2xl overflow-hidden bg-muted">
          {image ? (
            <Image src={image} alt={name} fill sizes="128px" className="object-cover" unoptimized />
          ) : (
            <div
              className={cn(
                "h-full w-full bg-gradient-to-br to-transparent",
                tone === "destructive"
                  ? "from-destructive/20 via-brand-rose/10"
                  : "from-primary/20 via-brand-purple/10",
              )}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-1">
        <div className="min-w-0">
          <p className="font-bold text-lg leading-tight truncate">{name}</p>
          {subtitle ? <div className="mt-1 text-2xs font-medium text-muted-foreground">{subtitle}</div> : null}
        </div>
        {price ? (
          <div className="shrink-0 text-right">
            {usdTotal ? (
              <p className={cn(face, "text-2xl")}>{usdTotal}</p>
            ) : (
              <p className={cn("flex items-center gap-2 justify-end text-2xl", face)}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
                  <CurrencyIcon symbol={price.currency} size={13} />
                </span>
                {crypto}
              </p>
            )}
            <p className="mt-0.5 inline-flex items-center justify-end gap-1.5 text-sm font-semibold text-muted-foreground">
              {usdTotal ? (
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
                  <CurrencyIcon symbol={price.currency} size={10} />
                </span>
              ) : null}
              {usdTotal ? (stable ? price.currency : `${crypto} ${price.currency}`) : price.currency}
            </p>
            {showTotal ? (
              <p className="mt-0.5 text-2xs text-muted-foreground/60">
                {formatDisplayPrice(price.formatted)} × {quantity} {price.currency}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface CurrencyPickerProps {
  currencies: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CurrencyPicker({ currencies, value, onChange, disabled }: CurrencyPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {currencies.map((c) => (
        <Button
          key={c}
          type="button"
          variant={value === c ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(c)}
          disabled={disabled}
          className="gap-1 px-2 text-xs w-full"
        >
          <CurrencyIcon symbol={c} size={13} className="shrink-0" />
          <span className="truncate">{c}</span>
        </Button>
      ))}
    </div>
  );
}

interface DurationPickerProps {
  options: ReadonlyArray<{ label: string; seconds: number }>;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  cols?: 3 | 4;
}

export function DurationPicker({ options, value, onChange, disabled, cols = 3 }: DurationPickerProps) {
  return (
    <div
      role="radiogroup"
      className={cn("grid gap-1 rounded-xl bg-muted/50 p-1", cols === 4 ? "grid-cols-4" : "grid-cols-3")}
    >
      {options.map((opt) => {
        const selected = value === opt.seconds;
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.seconds)}
            disabled={disabled}
            className={cn(
              "h-9 rounded-lg px-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 disabled:pointer-events-none disabled:opacity-50",
              selected
                ? "bg-gradient-to-br from-brand-blue to-brand-purple text-white shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface PriceCurrencyInputProps extends Omit<ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  currency: string;
  currencies: ReadonlyArray<string>;
  onCurrencyChange: (currency: string) => void;
}

export const PriceCurrencyInput = forwardRef<HTMLInputElement, PriceCurrencyInputProps>(
  ({ currency, currencies, onCurrencyChange, disabled, className, ...inputProps }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-input bg-background pr-2 transition-shadow focus-within:border-brand-purple/60 focus-within:ring-2 focus-within:ring-brand-purple/25",
          disabled && "opacity-60",
          className
        )}
      >
        <input
          ref={ref}
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          disabled={disabled}
          className="h-14 min-w-0 flex-1 bg-transparent px-4 text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed"
          {...inputProps}
        />
        <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
          <SelectTrigger
            aria-label="Currency"
            className="h-9 w-auto shrink-0 gap-1.5 rounded-lg border-0 bg-muted/70 px-2.5 text-xs font-bold hover:bg-muted focus:ring-brand-purple/40 focus:ring-offset-0"
          >
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <CurrencyIcon symbol={currency} size={14} />
                {currency}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {currencies.map((c) => (
              <SelectItem key={c} value={c}>
                <span className="flex items-center gap-2">
                  <CurrencyIcon symbol={c} size={14} />
                  {c}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);
PriceCurrencyInput.displayName = "PriceCurrencyInput";

interface ListingAssetSummaryProps {
  name: string;
  image?: string | null;
  fallbackIcon: ReactNode;
  badge?: ReactNode;
}

export function ListingAssetSummary({ name, image, fallbackIcon, badge }: ListingAssetSummaryProps) {
  return (
    <div className="flex shrink-0 items-center gap-3.5 border-b border-border/60 bg-gradient-to-br from-brand-blue/[0.08] via-brand-purple/[0.05] to-transparent px-5 py-4 pr-12">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
        {image ? (
          <Image src={image} alt={name} fill sizes="64px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue/20 via-brand-purple/10 to-transparent">
            {fallbackIcon}
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-1.5">
        <p className="truncate text-base font-semibold leading-tight">{name}</p>
        {badge}
      </div>
    </div>
  );
}

interface MarketplaceConfirmStepProps {
  summary?: ReactNode;
  description: string;
  error?: string | null;
  secondaryLabel: string;
  onSecondary: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryIcon?: ReactNode;
  primaryVariant?: "default" | "destructive";
  footer?: ReactNode;
}

export function MarketplaceConfirmStep({
  summary,
  description,
  error,
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryIcon,
  primaryVariant = "default",
  footer,
}: MarketplaceConfirmStepProps) {
  const primaryButton = primaryVariant === "destructive" ? (
    <Button
      variant="destructive"
      className="flex-1 h-11"
      disabled={primaryDisabled}
      onClick={onPrimary}
    >
      {primaryLabel}
    </Button>
  ) : (
    <div
      className={cn(
        "btn-border-animated p-[1px] rounded-xl flex-1",
        primaryDisabled && "pointer-events-none"
      )}
    >
      <button
        className="w-full h-11 rounded-[11px] flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] bg-transparent"
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryIcon}
        {primaryLabel}
      </button>
    </div>
  );

  return (
    <div className="px-6 pb-6 pt-3 space-y-4">
      {summary}
      <p className="text-sm text-muted-foreground">{description}</p>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="h-11 flex-1 gap-1.5"
          onClick={onSecondary}
        >
          {secondaryLabel}
        </Button>
        {primaryButton}
      </div>
      {footer}
    </div>
  );
}
