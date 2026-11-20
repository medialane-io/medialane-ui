"use client";

import { useState, useEffect, useRef } from "react";
import { normalizeAddress } from "@medialane/sdk";
import { Gem } from "lucide-react";
import { Button } from "./button.js";
import { Badge } from "./badge.js";
import Link from "./link.js";
import { useMedialaneApp } from "./medialane-app.js";
import { SectionCard, SectionHeader } from "./settings-section.js";
import { describeError } from "../utils/describe-error.js";
import { useT } from "../i18n/provider.js";

export function CollectionSlugClaimSection({
  contract,
  profile,
}: {
  contract: string;
  profile: { slug?: string | null } | null;
}) {
  const t = useT();
  const { getClient, ensureSignedIn, verifyEmailHref } = useMedialaneApp();
  const [slugInput, setSlugInput] = useState("");
  const [checkState, setCheckState] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [checkReason, setCheckReason] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const { claims } = await getClient().api.collections.mySlugClaims();
        const match = claims.find(
          (c) => normalizeAddress("STARKNET", c.contractAddress) === normalizeAddress("STARKNET", contract) && c.status === "PENDING"
        );
        if (match) setPendingSlug(match.slug);
      } catch {}
    })();
  }, [contract, getClient]);

  const handleCheck = async () => {
    const slug = slugInput.toLowerCase().trim();
    if (!slug) return;
    setCheckState("checking");
    setCheckReason(null);
    try {
      const result = await getClient().api.collections.slugAvailability(slug);
      setCheckState(result.available ? "available" : "taken");
      if (!result.available) setCheckReason(result.reason ?? "That slug is not available.");
    } catch {
      setCheckState("invalid");
      setCheckReason("Unable to check availability. Try again.");
    }
  };

  const handleSubmit = async () => {
    const slug = slugInput.toLowerCase().trim();
    if (!slug || checkState !== "available") return;
    setSubmitState("submitting");
    setSubmitError(null);
    try {
      await ensureSignedIn?.();
      const { claim } = await getClient().api.collections.submitSlugClaim(contract, slug);
      setPendingSlug(claim.slug);
      setSubmitState("done");
    } catch (err: unknown) {
      const msg = describeError(err).message;
      setSubmitError(msg);
      setSubmitState("error");
    }
  };

  if (profile?.slug) {
    return (
      <SectionCard className="border-brand-blue/20 bg-brand-blue/[0.02]">
        <SectionHeader
          icon={Gem}
          title={t("Collection URL")}
          description={`medialane.io/collection/${profile.slug}`}
          badge={
            <Badge variant="soft" className="text-2xs h-4 px-1.5 text-brand-blue border-brand-blue/30">
              {t("Active")}
            </Badge>
          }
        />
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t("Your collection is accessible at")}{" "}
            <span className="tabular-nums text-foreground">medialane.io/collection/{profile.slug}</span>
          </p>
        </div>
      </SectionCard>
    );
  }

  if (pendingSlug) {
    return (
      <SectionCard className="border-primary/20 bg-primary/[0.02]">
        <SectionHeader
          icon={Gem}
          title={t("Claim your collection URL")}
          description={`medialane.io/collection/${pendingSlug}`}
          badge={
            <Badge variant="soft" className="text-2xs h-4 px-1.5 text-brand-orange border-brand-orange/30">
              {t("Pending review")}
            </Badge>
          }
        />
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground">{t.rich("Your claim for {span} is under review. You'll be notified once it's approved.", { span: <span className="tabular-nums text-foreground">medialane.io/collection/{pendingSlug}</span> })}</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="border-primary/20 bg-primary/[0.02]">
      <SectionHeader
        icon={Gem}
        title={t("Claim your collection URL")}
        description={t("Reserve a unique URL — medialane.io/collection/your-name")}
      />
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <div className="panel flex-1 flex items-center px-3 py-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {t("medialane.io/collection/")}
            </span>
            <input
              type="text"
              className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50 min-w-0"
              placeholder={t("your-name")}
              value={slugInput}
              onChange={(e) => {
                setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                setCheckState("idle");
              }}
              onKeyDown={(e) => { if (e.key === "Enter") handleCheck(); }}
              maxLength={20}
            />
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={handleCheck}
            disabled={!slugInput.trim() || checkState === "checking"}
            className="shrink-0"
          >
            {checkState === "checking" ? t("Checking…") : t("Check")}
          </Button>
        </div>

        {checkState === "available" && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-brand-blue font-medium truncate">
              {t("✓ Available —")} <span className="tabular-nums">medialane.io/collection/{slugInput}</span>
            </p>
            <Button size="sm" onClick={handleSubmit} disabled={submitState === "submitting"} className="shrink-0">
              {submitState === "submitting" ? t("Claiming…") : t("Claim this URL")}
            </Button>
          </div>
        )}

        {(checkState === "taken" || checkState === "invalid") && (
          <p className="text-xs text-destructive">{checkReason ?? t("That slug is not available.")}</p>
        )}

        {submitState === "error" && (
          <p className="text-xs text-destructive">
            {submitError}
            {verifyEmailHref && submitError === "Verify your email to claim a collection." && (
              <>
                {" "}
                <Link href={verifyEmailHref} className="underline font-medium hover:text-foreground">
                  {t("Verify email")}
                </Link>
              </>
            )}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {t("3–20 characters, lowercase letters, numbers, underscores or hyphens. Claims are reviewed before going live.")}
        </p>
      </div>
    </SectionCard>
  );
}
