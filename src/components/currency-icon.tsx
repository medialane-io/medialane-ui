"use client";

import Image from "next/image";
import { cn } from "../utils/cn.js";

const CURRENCY_ICON_PATHS: Record<string, string> = {
  USDC: "/usdc.svg",
  USDT: "/usdt.svg",
  ETH: "/eth.svg",
  STRK: "/strk.svg",
  WBTC: "/btc.svg",
};

export interface CurrencyIconProps {
  symbol: string | null | undefined;
  size?: number;
  className?: string;

  iconsBasePath?: string;
}

export function CurrencyIcon({ symbol, size = 16, className, iconsBasePath = "" }: CurrencyIconProps) {
  const path = symbol ? CURRENCY_ICON_PATHS[symbol] : undefined;
  if (!path) return null;
  return (
    <Image
      src={`${iconsBasePath}${path}`}
      alt={symbol ?? ""}
      width={size}
      height={size}
      className={cn("inline-block shrink-0", className)}
      unoptimized
    />
  );
}

export interface CurrencyAmountProps {
  amount: string;
  symbol: string | null | undefined;
  amountClassName?: string;
  iconSize?: number;
  className?: string;

  iconsBasePath?: string;
}

export function CurrencyAmount({
  amount,
  symbol,
  amountClassName,
  iconSize = 14,
  className,
  iconsBasePath,
}: CurrencyAmountProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <CurrencyIcon symbol={symbol} size={iconSize} iconsBasePath={iconsBasePath} />
      <span className={amountClassName}>{amount}</span>
    </span>
  );
}
