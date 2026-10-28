"use client";

import type { ReactNode } from "react";
import { Check, ImageIcon } from "lucide-react";
import Link from "./link.js";
import Image from "./image.js";
import { Button } from "./button.js";
import { MarketplaceTxLink } from "./marketplace-dialog-primitives.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";

export interface TransactionSuccessAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TransactionSuccessProps {
  name: string;
  image?: string | null;
  title: string;
  description?: ReactNode;
  txHash?: string | null;
  actions: Array<TransactionSuccessAction | undefined>;
  children?: ReactNode;
}

export function TransactionSuccess({ name, image, title, description, txHash, actions, children }: TransactionSuccessProps) {
  const shown = actions.filter((a): a is TransactionSuccessAction => !!a);
  return (
    <div className="flex w-full flex-col items-center gap-6 py-2 text-center">
      <div className="relative">
        <div className="relative h-40 w-40 overflow-hidden rounded-3xl border border-border bg-muted shadow-lg">
          {image ? (
            <Image src={image} alt={name} fill sizes="160px" unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>
        <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-background">
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
      </div>

      <div className="w-full min-w-0 space-y-1">
        <p className="line-clamp-2 break-words text-xl font-bold">{name}</p>
        <p className="font-medium">{title}</p>
        {description && <div className="break-words text-sm text-muted-foreground">{description}</div>}
        {txHash && <MarketplaceTxLink txHash={txHash} explorerUrl={EXPLORER_URL} className="pt-1" />}
      </div>

      <div className="flex w-full flex-col gap-2">
        {shown.map((action, i) => (
          <Button key={action.label} asChild={!!action.href} variant={i === 0 ? "default" : "outline"} className="w-full" onClick={action.onClick}>
            {action.href ? <Link href={action.href}>{action.label}</Link> : action.label}
          </Button>
        ))}
      </div>

      {children}
    </div>
  );
}
