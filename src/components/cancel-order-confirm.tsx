"use client";

import type { ComponentProps } from "react";
import { MarketplaceConfirmStep, OrderSummaryHero } from "./marketplace-dialog-primitives.js";
import { useT } from "../i18n/provider.js";

export interface CancelOrderConfirmProps {
  variant: "listing" | "offer";
  name: string;
  image?: string | null;
  price?: ComponentProps<typeof OrderSummaryHero>["price"];
  error?: string | null;
  onKeep: () => void;
  onConfirm: () => void;
}

export function CancelOrderConfirm({ variant, name, image, price, error, onKeep, onConfirm }: CancelOrderConfirmProps) {
  const t = useT();
  return (
    <div>
      <OrderSummaryHero name={name} image={image} price={price} tone="destructive" />
      <MarketplaceConfirmStep
        description={t("This order will be permanently removed onchain.")}
        error={error}
        secondaryLabel={t("Keep it")}
        onSecondary={onKeep}
        primaryLabel={`Cancel ${variant}`}
        onPrimary={onConfirm}
        primaryVariant="destructive"
      />
    </div>
  );
}
