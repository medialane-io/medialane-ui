"use client";

import { ArrowLeft } from "lucide-react";
import Link from "./link.js";
import { useRouter } from "./router.js";
import { useT } from "../i18n/provider.js";

const className = "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors";

export interface BackButtonProps {
  href?: string;
  label?: string;
  fallbackHref?: string;
}

export function BackButton({ href, label, fallbackHref = "/launchpad" }: BackButtonProps) {
  const t = useT();
  const router = useRouter();
  const content = (
    <>
      <ArrowLeft className="h-3.5 w-3.5" />
      {label ?? t("Back")}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
      className={className}
    >
      {content}
    </button>
  );
}
