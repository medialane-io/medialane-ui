"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Check, Loader2, Minus, Plus } from "lucide-react";
import { formatAmount, type ApiOrder } from "@medialane/sdk";
import Image from "./image.js";
import { Alert, AlertDescription } from "./alert.js";
import { CurrencyIcon } from "./currency-icon.js";
import { cn } from "../utils/cn.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";
import { useUsdPrices, usdValueFor } from "../utils/use-usd-prices.js";
import { pickPayment, usePaymentOptions, type PaymentOption } from "../utils/use-payment-options.js";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";

export function amountText(raw: bigint, decimals: number): string {
  const [whole, frac = ""] = formatAmount(raw.toString(), decimals).split(".");
  const lead = whole === "0" ? (frac.match(/^0*/)?.[0].length ?? 0) : 0;
  const shown = frac.slice(0, lead + 4).replace(/0+$/, "");
  return shown ? `${whole}.${shown}` : whole;
}

export interface PurchasePanelProps {
  order: ApiOrder;
  image?: string | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  walletAddress: string | null;
  payWith: string | null;
  onPayWithChange: (symbol: string | null) => void;
  onAddFunds?: () => void;
  error?: string | null;
  children: ReactNode;
}

export function editionsAvailable(order: ApiOrder): number | null {
  if (order.offer.itemType !== "ERC1155") return null;
  return Math.max(1, parseInt(order.remainingAmount ?? order.offer.startAmount ?? "1", 10));
}

export function PurchasePanel({
  order,
  image,
  quantity,
  onQuantityChange,
  walletAddress,
  payWith,
  onPayWithChange,
  onAddFunds,
  error,
  children,
}: PurchasePanelProps) {
  const name = order.token?.name || `Token #${order.nftTokenId}`;
  const price = order.price;
  const currency = price?.currency ?? null;
  const available = editionsAvailable(order);
  const { cost, options, isLoading } = usePaymentOptions({ order, quantity, walletAddress });

  const picked = isLoading ? payWith : pickPayment(options, payWith);
  useEffect(() => {
    if (picked !== payWith) onPayWithChange(picked);
  }, [picked, payWith, onPayWithChange]);

  const paying = options.find((o) => o.symbol === payWith) ?? null;
  const totalSymbol = paying?.symbol ?? currency;
  const totalRaw = paying ? paying.cost : cost.total;
  const totalDecimals = paying?.decimals ?? price?.decimals ?? 18;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-3.5 pr-8">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          {image ? <Image src={image} alt={name} fill sizes="56px" className="object-cover" unoptimized /> : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight">{name}</p>
          {price?.formatted && currency ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
              <CurrencyIcon symbol={currency} size={12} />
              {formatDisplayPrice(price.formatted)} {currency}
            </p>
          ) : null}
        </div>
      </div>

      {available !== null && available > 1 ? (
        <QuantityField value={quantity} max={available} onChange={onQuantityChange} />
      ) : null}

      {walletAddress && currency ? (
        <PayWith
          options={options}
          isLoading={isLoading}
          selected={payWith}
          onSelect={onPayWithChange}
          onAddFunds={onAddFunds}
        />
      ) : null}

      <TotalLine symbol={totalSymbol} raw={totalRaw} decimals={totalDecimals} feeBps={cost.feeBps} />

      <div className="flex flex-col gap-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function QuantityField({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  const t = useT();
  const format = useFormat();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const clamp = (n: number) => Math.max(1, Math.min(max, Number.isFinite(n) ? Math.floor(n) : 1));
  const commit = () => onChange(clamp(parseInt(draft, 10)));
  const step = "grid h-10 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl";

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{t("Quantity")}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{t("{count} available", { count: format.number(max) })}</p>
      </div>
      <div className="flex items-center rounded-xl border border-border">
        <button type="button" className={step} disabled={value <= 1} onClick={() => onChange(clamp(value - 1))} aria-label={t("Decrease quantity")}>
          <Minus className="h-4 w-4" />
        </button>
        <input
          inputMode="numeric"
          aria-label={t("Quantity")}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
          className="h-10 w-14 bg-transparent text-center text-base font-semibold tabular-nums outline-none"
        />
        <button type="button" className={step} disabled={value >= max} onClick={() => onChange(clamp(value + 1))} aria-label={t("Increase quantity")}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PayWith({
  options,
  isLoading,
  selected,
  onSelect,
  onAddFunds,
}: {
  options: PaymentOption[];
  isLoading: boolean;
  selected: string | null;
  onSelect: (symbol: string) => void;
  onAddFunds?: () => void;
}) {
  const t = useT();
  const nothingCovers = !isLoading && !options.some((o) => o.covers);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t("Pay with")}</p>
      {isLoading && options.length === 0 ? (
        <div className="flex h-14 items-center justify-center gap-2 rounded-xl border border-border text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("Checking your balances…")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("Pay with")}>
          {options.map((option) => (
            <CoinChoice
              key={option.symbol}
              option={option}
              quoting={isLoading && option.cost === null}
              selected={selected === option.symbol}
              onSelect={() => onSelect(option.symbol)}
            />
          ))}
        </div>
      )}
      {nothingCovers ? (
        <p className="text-xs text-muted-foreground">
          {t("Add funds to your wallet to buy this.")}{" "}
          {onAddFunds ? (
            <button type="button" onClick={onAddFunds} className="font-semibold text-primary hover:underline">
              {t("Add funds")}
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

function CoinChoice({ option, quoting, selected, onSelect }: { option: PaymentOption; quoting: boolean; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!option.covers}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary/[0.06]" : "border-border hover:bg-muted/40",
        !option.covers && "opacity-45",
      )}
    >
      <CurrencyIcon symbol={option.symbol} size={20} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight">{option.symbol}</span>
        <span className="block truncate text-xs text-muted-foreground tabular-nums">{amountText(option.balance, option.decimals)}</span>
      </span>
      {quoting ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
      ) : selected ? (
        <Check className="h-4 w-4 shrink-0 text-primary" />
      ) : null}
    </button>
  );
}

function TotalLine({ symbol, raw, decimals, feeBps }: { symbol: string | null; raw: bigint | null; decimals: number; feeBps: number }) {
  const t = useT();
  const prices = useUsdPrices();
  const text = raw !== null ? amountText(raw, decimals) : null;
  const usd = text && symbol && !isStableCurrency(symbol) ? usdValueFor(text, symbol, prices) : null;

  return (
    <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
      <div>
        <p className="text-sm font-medium">{t("Total")}</p>
        {feeBps > 0 ? (
          <p className="text-xs text-muted-foreground">{t("Includes {percent}% platform fee", { percent: String(feeBps / 100) })}</p>
        ) : null}
      </div>
      <div className="text-right">
        <p className="flex items-center justify-end gap-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight tabular-nums">
          {symbol ? <CurrencyIcon symbol={symbol} size={18} /> : null}
          {text ?? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          {text && symbol ? <span className="text-base font-bold text-muted-foreground">{symbol}</span> : null}
        </p>
        {usd ? <p className="text-xs text-muted-foreground tabular-nums">≈ {usd}</p> : null}
      </div>
    </div>
  );
}
