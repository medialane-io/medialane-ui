"use client";

import { useState } from "react";
import { normalizeAddress } from "@medialane/sdk";
import { buildPopAllowlist, popClaimLinks, popClaimLinksCsv, type PopClaimLink } from "@medialane/sdk/starknet";
import { ArrowLeft, Award, AlertCircle, CheckCircle2, Download, Loader2, Send, Users } from "lucide-react";
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
import { useCollection } from "../utils/use-collections.js";
import { useTransaction } from "../utils/use-transaction.js";

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
  const [raw, setRaw] = useState("");
  const address = raw.trim();
  const valid = /^0x[0-9a-fA-F]{1,64}$/.test(address);

  return (
    <div className="bento-cell p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-green-500" />
        <span className="font-semibold text-sm">Issue directly</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Send the credential straight to one wallet — for a late participant, without republishing the list or
        changing anyone&apos;s claim link.
      </p>
      <input
        type="text"
        placeholder="0x..."
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        disabled={!valid || isSubmitting}
        onClick={() => {
          onIssue(address);
          setRaw("");
        }}
      >
        <Send className="h-3.5 w-3.5 mr-1.5" />
        Issue credential
      </Button>
    </div>
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
  const [raw, setRaw] = useState("");
  const parsed = parseAddresses(raw);

  return (
    <div className="bento-cell p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-green-500" />
        <span className="font-semibold text-sm">Participants</span>
        {parsed.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {parsed.length} address{parsed.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Paste every participant&apos;s wallet address. Publishing replaces the previous list and every link
        sent before it — send the new links to everyone who hasn&apos;t claimed yet. The list stays in this
        browser: download the claim links and send each participant theirs.
      </p>
      <Textarea
        placeholder={"Paste Starknet addresses, one per line:\n0x04a...\n0x06b..."}
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="tabular-nums text-xs resize-none"
      />
      <Button
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={parsed.length === 0 || isSubmitting}
        onClick={() => onPublish(parsed)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            Publishing…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Publish {parsed.length > 0 ? `${parsed.length} participant${parsed.length !== 1 ? "s" : ""}` : "participants"}
          </>
        )}
      </Button>
      {links && (
        <div className="space-y-2 pt-2">
          <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCsv(links)}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download claim links (CSV)
          </Button>
          <ul className="max-h-48 overflow-auto text-xs tabular-nums space-y-1 text-muted-foreground">
            {links.map((link) => (
              <li key={link.address} className="truncate">{link.address}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PopManagePage({ contract }: { contract: string }) {
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
    setDone({ title: "Credential issued", description: "The credential is now in their wallet." });
    void tx.run(async (signer) => {
      await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-manage", { owner: signer.address, collection: contract, action: "issue", recipient }));
    });
  };

  const publish = (addresses: string[]) => {
    const list = buildPopAllowlist(addresses);
    const count = Object.keys(list.proofs).length;
    setDone({ title: "Participants published", description: `Published ${count} participant${count !== 1 ? "s" : ""}.` });
    void tx
      .run(async (signer) => {
        await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-manage", { owner: signer.address, collection: contract, action: "set_allowlist_root", root: list.root }));
      })
      .then((ok) => {
        if (ok) setLinks(popClaimLinks(window.location.origin, contract, list));
      });
  };

  return (
    <WalletRequired icon={Award} title="Connect your wallet" description="Connect to manage your event.">
      {isLoading ? (
        <div className="max-w-xl mx-auto px-4 pt-10 pb-16 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : !collection ? (
        <div className="max-w-xl mx-auto px-4 pt-24 pb-8 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto" />
          <p className="text-muted-foreground">Collection not found.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/launchpad/pop">← Back</Link>
          </Button>
        </div>
      ) : !isOwner ? (
        <div className="max-w-xl mx-auto px-4 pt-24 pb-8 text-center space-y-4">
          <Award className="h-10 w-10 text-muted-foreground/20 mx-auto" />
          <p className="text-muted-foreground">You are not the organizer of this event.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/launchpad/pop">← Back to events</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-4 pt-10 pb-16 space-y-6">
          <TransactionDialog tx={tx} title="Manage event" workingLabel="Updating your event…" firstStepLabel="Prepare">
            <TransactionSuccess name={collection.name ?? "Event"} title={done.title} description={done.description} txHash={tx.txHash} actions={[{ label: "Done", onClick: tx.reset }]} />
          </TransactionDialog>

          <FadeIn>
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/launchpad/pop">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                All events
              </Link>
            </Button>
          </FadeIn>

          <FadeIn delay={0.04}>
            <div>
              <span className="pill-badge inline-flex gap-1.5 mb-2">
                <Award className="h-3 w-3" />
                Organizer
              </span>
              <h1 className="text-2xl font-bold mt-1">Manage Event</h1>
              <p className="text-sm text-muted-foreground">{collection.name ?? contract}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="bento-cell p-4 flex items-center gap-3">
              <Award className="h-4 w-4 text-green-500 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Only participants on your <strong className="text-foreground">published list</strong> can claim,
                with the link you send them.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <AllowlistSection onPublish={publish} isSubmitting={isSubmitting} links={links} />
          </FadeIn>

          <FadeIn delay={0.16}>
            <IssueSection onIssue={issue} isSubmitting={isSubmitting} />
          </FadeIn>
        </div>
      )}
    </WalletRequired>
  );
}
