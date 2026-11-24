"use client";

import { PageContainer } from "./page-container.js";
import { PageHeader, PageHeaderSkeleton } from "./page-header.js";
import { PageState } from "./page-state.js";
import { BackButton } from "./back-button.js";
import { Section } from "./create-form-primitives.js";
import { Input } from "./input.js";
import { useState } from "react";
import { normalizeAddress } from "@medialane/sdk";
import { buildPopAllowlist, popClaimLinks, popClaimLinksCsv, type PopClaimLink } from "@medialane/sdk/starknet";
import { Award, AlertCircle, CheckCircle2, Download, Loader2, Send, Users } from "lucide-react";
import { Button } from "./button.js";
import Link from "./link.js";
import { useMedialaneApp } from "./medialane-app.js";
import { FadeIn } from "./motion-primitives.js";
import { Skeleton } from "./skeleton.js";
import { Textarea } from "./textarea.js";
import { TransactionDialog } from "./transaction-dialog.js";
import { TransactionSuccess } from "./transaction-success.js";
import { WalletRequired } from "./wallet-required.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { successMessages } from "../utils/success-messages.js";
import { useCollection } from "../utils/use-collections.js";
import { useTransaction } from "../utils/use-transaction.js";
import { useT } from "../i18n/provider.js";

function parseAddresses(raw: string): string[] {
  return raw
    .split(/[\n,\s]+/)
    .map((a) => a.trim())
    .filter((a) => /^0x[0-9a-fA-F]+$/.test(a));
}

function downloadCsv(links: PopClaimLink[]) {
  const href = URL.createObjectURL(new Blob([popClaimLinksCsv(links)], { type: "text/csv" }));
  const anchor = Object.assign(document.createElement("a"), { href, download: "claim-links.csv" });
  anchor.click();
  URL.revokeObjectURL(href);
}

function IssueSection({
  onIssue,
  isSubmitting,
}: {
  onIssue: (address: string) => void;
  isSubmitting: boolean;
}) {
  const t = useT();
  const [raw, setRaw] = useState("");
  const address = raw.trim();
  const valid = /^0x[0-9a-fA-F]{1,64}$/.test(address);

  return (
    <Section title={t("Issue directly")} icon={<Award className="h-4 w-4" />}>
      <p className="text-xs text-muted-foreground">
        {t("Send a certificate to one wallet.")}
      </p>
      <Input placeholder="0x..." value={raw} onChange={(e) => setRaw(e.target.value)} className="tabular-nums" />
      <Button
        size="sm"
        variant="soft"
        className="w-full"
        disabled={!valid || isSubmitting}
        onClick={() => {
          onIssue(address);
          setRaw("");
        }}
      >
        <Send className="h-3.5 w-3.5 mr-1.5" />
        {t("Issue certificate")}
      </Button>
    </Section>
  );
}

function AllowlistSection({
  onPublish,
  isSubmitting,
  links,
}: {
  onPublish: (addresses: string[]) => void;
  isSubmitting: boolean;
  links: PopClaimLink[] | null;
}) {
  const t = useT();
  const [raw, setRaw] = useState("");
  const parsed = parseAddresses(raw);

  return (
    <Section
      title={t("Participants")}
      icon={<Users className="h-4 w-4" />}
      action={parsed.length > 0 ? t.plural("{count} address", "{count} addresses", parsed.length) : undefined}
    >
      <p className="text-xs text-muted-foreground">
        {t("Publishing replaces the previous list and its links.")}
      </p>
      <Textarea
        placeholder={t("Paste Starknet addresses, one per line:\n0x04a...\n0x06b...")}
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="tabular-nums text-xs resize-none"
      />
      <Button
        size="sm"
        className="w-full bg-brand-blue text-white hover:brightness-110"
        disabled={parsed.length === 0 || isSubmitting}
        onClick={() => onPublish(parsed)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            {t("Publishing…")}
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            {parsed.length > 0 ? t.plural("Publish {count} participant", "Publish {count} participants", parsed.length) : t("Publish participants")}
          </>
        )}
      </Button>
      {links && (
        <div className="space-y-2 pt-2">
          <Button variant="soft" size="sm" className="w-full" onClick={() => downloadCsv(links)}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("Download claim links (CSV)")}
          </Button>
          <ul className="max-h-48 overflow-auto text-xs tabular-nums space-y-1 text-muted-foreground">
            {links.map((link) => (
              <li key={link.address} className="truncate">{link.address}</li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

export function PopManagePage({ contract }: { contract: string }) {
  const t = useT();
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const { collection, isLoading } = useCollection(contract);
  const tx = useTransaction();
  const [done, setDone] = useState({ title: "", description: "" });
  const [links, setLinks] = useState<PopClaimLink[] | null>(null);
  const isSubmitting = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  const isOwner =
    walletAddress &&
    collection?.owner &&
    normalizeAddress("STARKNET", walletAddress) === normalizeAddress("STARKNET", collection.owner);

  const issue = (recipient: string) => {
    setDone(successMessages.certificateIssued(t));
    void tx.run(async (signer) => {
      await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-manage", { owner: signer.address, collection: contract, action: "issue", recipient }));
    });
  };

  const publish = (addresses: string[]) => {
    const list = buildPopAllowlist(addresses);
    const count = Object.keys(list.proofs).length;
    setDone(successMessages.participantsPublished({ count }, t));
    void tx
      .run(async (signer) => {
        await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-manage", { owner: signer.address, collection: contract, action: "set_allowlist_root", root: list.root }));
      })
      .then((ok) => {
        if (ok) setLinks(popClaimLinks(window.location.origin, contract, list));
      });
  };

  return (
    <WalletRequired icon={Award} title={t("Connect your wallet")} description={t("Connect to manage your event.")}>
      {isLoading ? (
        <PageContainer variant="form" className="space-y-8">
          <PageHeaderSkeleton />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </PageContainer>
      ) : !collection ? (
        <PageState icon={AlertCircle} description={t("Collection not found.")}>
          <Button asChild variant="soft" size="sm">
            <Link href="/launchpad/pop">{t("← Back")}</Link>
          </Button>
        </PageState>
      ) : !isOwner ? (
        <PageState icon={Award} description={t("You are not the organizer of this event.")}>
          <Button asChild variant="soft" size="sm">
            <Link href="/launchpad/pop">{t("← Back to events")}</Link>
          </Button>
        </PageState>
      ) : (
        <PageContainer variant="form" className="space-y-8">
          <TransactionDialog tx={tx} title={t("Manage event")} workingLabel={t("Updating your event…")} firstStepLabel={t("Prepare")}>
            <TransactionSuccess name={collection.name ?? t("Event")} title={done.title} description={done.description} txHash={tx.txHash} actions={[{ label: t("Done"), onClick: tx.reset }]} />
          </TransactionDialog>

          <PageHeader
            back={<BackButton href="/launchpad/pop" label={t("All events")} />}
            icon={<Award />}
            title={t("Manage event")}
            subtitle={collection.name ?? contract}
          />

          <FadeIn delay={0.08}>
            <div className="panel relative overflow-hidden p-4 flex items-center gap-3">
              <Award className="h-4 w-4 text-brand-blue shrink-0" />
              <p className="text-xs text-muted-foreground">{t.rich("Only the {strong} can claim.", { strong: <strong className="text-foreground">{t("published list")}</strong> })}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <AllowlistSection onPublish={publish} isSubmitting={isSubmitting} links={links} />
          </FadeIn>

          <FadeIn delay={0.16}>
            <IssueSection onIssue={issue} isSubmitting={isSubmitting} />
          </FadeIn>
        </PageContainer>
      )}
    </WalletRequired>
  );
}
