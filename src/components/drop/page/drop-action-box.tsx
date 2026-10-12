"use client";

import { Minus, Plus } from "lucide-react";
import { DropCountdown } from "../../drop-countdown.js";
import { DropStatusBadge, DropSupplyProgress } from "../../drop-status-display.js";
import { GradientButton } from "../../gradient-button.js";
import type { ActionBoxView } from "../../../utils/drop/view.js";

export interface DropActionBoxProps {
  view: ActionBoxView;
  minted: bigint;
  maxSupply: bigint;
  quantity: bigint;
  onQuantity: (q: bigint) => void;
  onAction: () => void;
}

export function DropActionBox({ view, minted, maxSupply, quantity, onQuantity, onAction }: DropActionBoxProps) {
  const canPick = view.button.action === "mint" && view.maxQuantity > 1n;
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <DropStatusBadge phase={view.phase} />
        <span className="text-xs text-muted-foreground">{view.statusText}</span>
      </div>
      {view.countdown && <DropCountdown targetTs={view.countdown.target} label={view.countdown.label} />}
      {maxSupply > 0n
        ? <DropSupplyProgress minted={Number(minted)} max={Number(maxSupply)} />
        : <p className="text-sm text-muted-foreground">{Number(minted).toLocaleString("en-US")} minted</p>}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-xl font-bold">{view.priceText}</p>
        </div>
        {canPick && (
          <div className="flex items-center gap-2" aria-label="Quantity">
            <span className="sr-only">Quantity</span>
            <button type="button" className="rounded-md border border-border p-2" disabled={quantity <= 1n} onClick={() => onQuantity(quantity - 1n)}><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-8 text-center font-semibold tabular-nums">{quantity.toString()}</span>
            <button type="button" className="rounded-md border border-border p-2" disabled={quantity >= view.maxQuantity} onClick={() => onQuantity(quantity + 1n)}><Plus className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
      {view.totalText && <p className="text-sm text-muted-foreground">{view.totalText}</p>}
      {view.eligibility && <p className="text-sm">{view.eligibility}</p>}
      <GradientButton big disabled={view.button.action === "none"} onClick={onAction} className="disabled:opacity-50">
        {view.button.label}
      </GradientButton>
    </div>
  );
}
