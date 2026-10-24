"use client";

import { useState } from "react";
import Link from "../link.js";
import Image from "../image.js";
import { short } from "../../utils/media-wallet/wallet-format.js";
import { CopyIcon } from "./copy-icon.js";
import { useMediaWalletApp, type MediaWalletHeaderIdentity } from "./types.js";

const noIdentity = (): MediaWalletHeaderIdentity => ({});

export function MediaWalletHeader({ address, onNavigate }: { address: string; onNavigate: () => void }) {
  const { useHeaderIdentity = noIdentity, useAccountEmail } = useMediaWalletApp();
  const headerIdentity = useHeaderIdentity(address);
  const accountEmail = useAccountEmail();
  const [copied, setCopied] = useState(false);
  const avatarUrl = headerIdentity?.avatarUrl ?? null;

  const copy = () => {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const headline = headerIdentity?.headline ?? short(address);

  return (
    <header className="flex flex-col items-center gap-2 pt-6">
      <Link
        href="/settings"
        onClick={onNavigate}
        aria-label="Profile and settings"
        className="relative h-20 w-20 shrink-0 transition-transform active:scale-95"
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-foreground/[0.06] ring-2 ring-foreground/10">
          <Image
            src={avatarUrl ?? "/icon.png"}
            alt=""
            fill
            unoptimized
            className={avatarUrl ? "object-cover" : "object-cover p-[16%]"}
          />
        </div>
        {headerIdentity?.badge}
      </Link>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
      >
        {headline}
        {copied ? (
          <span className="text-2xs font-normal text-muted-foreground">copied ✓</span>
        ) : (
          <CopyIcon className="shrink-0 opacity-50" />
        )}
      </button>
      {accountEmail && <span className="text-xs text-muted-foreground">{accountEmail}</span>}
    </header>
  );
}
