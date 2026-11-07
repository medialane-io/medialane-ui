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

export function CollectionSlugClaimSection({
  contract,
  profile,
}: {
  contract: string;
  profile: { slug?: string | null } | null;
}) {
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
      <SectionCard className="border-emerald-500/20 bg-emerald-500/[0.02]">
        <SectionHeader
          icon={Gem}
          title="Collection URL"
          description={`medialane.io/collection/${profile.slug}`}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/15"
          badge={
            <Badge variant="outline" className="text-2xs h-4 px-1.5 text-emerald-600 border-emerald-500/30">
              Active
            </Badge>
          }
        />
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Your collection is accessible at{" "}
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
          title="Claim your collection URL"
          description={`medialane.io/collection/${pendingSlug}`}
          iconClass="text-primary"
          bgClass="bg-primary/15"
          badge={
            <Badge variant="outline" className="text-2xs h-4 px-1.5 text-amber-600 border-amber-500/30">
              Pending review
            </Badge>
          }
        />
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Your claim for{" "}
            <span className="tabular-nums text-foreground">medialane.io/collection/{pendingSlug}</span> is under
            review. You&apos;ll be notified once it&apos;s approved.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="border-primary/20 bg-primary/[0.02]">
      <SectionHeader
        icon={Gem}
        title="Claim your collection URL"
        description="Reserve a unique URL — medialane.io/collection/your-name"
        iconClass="text-primary"
        bgClass="bg-primary/15"
      />
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-lg border border-border bg-muted/40 px-3 py-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              medialane.io/collection/
            </span>
            <input
              type="text"
              className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50 min-w-0"
              placeholder="your-name"
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
            variant="outline"
            size="sm"
            onClick={handleCheck}
            disabled={!slugInput.trim() || checkState === "checking"}
            className="shrink-0"
          >
            {checkState === "checking" ? "Checking…" : "Check"}
          </Button>
        </div>

        {checkState === "available" && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-emerald-600 font-medium truncate">
              ✓ Available — <span className="tabular-nums">medialane.io/collection/{slugInput}</span>
            </p>
            <Button size="sm" onClick={handleSubmit} disabled={submitState === "submitting"} className="shrink-0">
              {submitState === "submitting" ? "Claiming…" : "Claim this URL"}
            </Button>
          </div>
        )}

        {(checkState === "taken" || checkState === "invalid") && (
          <p className="text-xs text-destructive">{checkReason ?? "That slug is not available."}</p>
        )}

        {submitState === "error" && (
          <p className="text-xs text-destructive">
            {submitError}
            {verifyEmailHref && submitError === "Verify your email to claim a collection." && (
              <>
                {" "}
                <Link href={verifyEmailHref} className="underline font-medium hover:text-foreground">
                  Verify email
                </Link>
              </>
            )}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          3–20 characters, lowercase letters, numbers, underscores or hyphens. Claims are reviewed before
          going live.
        </p>
      </div>
    </SectionCard>
  );
}
