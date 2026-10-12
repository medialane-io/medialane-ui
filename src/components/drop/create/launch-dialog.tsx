"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { dropHref } from "@medialane/sdk";
import { buildPopAllowlist, dropClaimLinks, popClaimLinksCsv, type PopClaimLink } from "@medialane/sdk/starknet";
import { ActionDialog } from "../../action-dialog.js";
import { GradientButton } from "../../gradient-button.js";
import { Button } from "../../button.js";
import { ShareButton } from "../../share-button.js";
import { describeError } from "../../../utils/describe-error.js";
import { uploadDirectoryToIpfs, uploadFileToIpfs } from "../../../utils/ipfs-upload.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { buildDropMetadataFiles, metadataBytes, MAX_DROP_METADATA_BYTES } from "../../../utils/drop/metadata.js";
import { toDropTerms, priceLabel } from "../../../utils/drop/sale.js";
import { draftSupply, type DropDraft } from "../../../utils/drop/draft.js";
import { uploadAll, type UploadTask } from "../../../utils/drop/upload.js";
import { launchDrop, saveExclusiveContent } from "../../../utils/drop/actions.js";
import type { DropAppProps } from "../../../utils/drop/types.js";

type Step =
  | { kind: "review" }
  | { kind: "uploading" }
  | { kind: "launching" }
  | { kind: "done"; collection: string; links: PopClaimLink[]; warning: string | null }
  | { kind: "error"; message: string };

export function LaunchDialog({ open, onClose, draft, app }: { open: boolean; onClose: () => void; draft: DropDraft; app: DropAppProps }) {
  const [step, setStep] = useState<Step>({ kind: "review" });
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [baseUri, setBaseUri] = useState<string | null>(null);
  const client = app.getClient();
  const files = draft.kind === "edition" ? (draft.edition ? [draft.edition] : []) : draft.items.map((i) => i.file);
  const terms = toDropTerms(draft.sale);
  const list = useMemo(
    () => (draft.listOnly ? buildPopAllowlist(parseAllowlist(draft.allowlist).addresses) : null),
    [draft.listOnly, draft.allowlist],
  );

  const run = async () => {
    try {
      let uri = baseUri;
      if (!uri) {
        setStep({ kind: "uploading" });
        const initial = tasks.length > 0 ? tasks : [
          ...files.map((file, i) => ({ id: `art-${i}`, file, status: "pending" as const, uri: null, error: null })),
          ...(draft.cover ? [{ id: "cover", file: draft.cover, status: "pending" as const, uri: null, error: null }] : []),
        ];
        const done = await uploadAll(initial, async (f) => (await uploadFileToIpfs(client.api, f, "image")).uri, setTasks);
        setTasks(done);
        if (done.some((t) => t.status !== "done")) {
          setStep({ kind: "error", message: "Some files didn't upload. Retry to send only those." });
          return;
        }
        const art = done.filter((t) => t.id.startsWith("art-"));
        const metadata = buildDropMetadataFiles({
          kind: draft.kind,
          name: draft.name.trim(),
          description: draft.description.trim(),
          creator: app.walletAddress!,
          coverUri: done.find((t) => t.id === "cover")?.uri ?? null,
          license: draft.license,
          registrationDate: new Date().toISOString().slice(0, 10),
          items: draft.kind === "edition"
            ? [{ name: "", description: "", imageUri: art[0]!.uri! }]
            : draft.items.map((it, i) => ({ name: it.name, description: it.description, imageUri: art[i]!.uri! })),
          supply: draftSupply(draft),
        });
        if (metadataBytes(metadata) > MAX_DROP_METADATA_BYTES) {
          setStep({ kind: "error", message: "The descriptions are too long for this many tokens. Shorten them and try again." });
          return;
        }
        uri = (await uploadDirectoryToIpfs(client.api, metadata)).baseUri;
        setBaseUri(uri);
      }
      setStep({ kind: "launching" });
      const signer = await app.getSigner();
      const { collection } = await launchDrop({ client, provider: app.provider, signer }, {
        owner: app.walletAddress!,
        name: draft.name.trim(),
        symbol: draft.symbol,
        baseUri: uri!,
        maxSupply: draftSupply(draft),
        terms,
        allowlistRoot: list?.root,
        description: draft.description.trim() || undefined,
      });
      let warning: string | null = null;
      if (draft.gated.enabled) {
        try {
          await saveExclusiveContent(client, collection, draft.gated);
        } catch {
          warning = "Your drop launched, but the exclusive content wasn't saved. You can add it from Manage.";
        }
      }
      setStep({ kind: "done", collection, links: list ? dropClaimLinks(window.location.origin, collection, list) : [], warning });
    } catch (err) {
      setStep({ kind: "error", message: describeError(err, "We couldn't launch your drop. Please try again.").message });
    }
  };

  const close = () => {
    if (step.kind === "uploading" || step.kind === "launching") return;
    onClose();
  };

  return (
    <ActionDialog open={open} onClose={close}>
      <div className="space-y-5 p-6">
        {step.kind === "review" && (
          <>
            <h2 className="text-lg font-semibold">Review and launch</h2>
            <div className="space-y-2 rounded-xl border border-border p-4 text-sm">
              <p className="font-semibold">{draft.name}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Fixed after launch</p>
              <Row label="Price" value={priceLabel(terms.price, terms.paymentToken)} />
              <Row label="Supply" value={`${draftSupply(draft).toLocaleString("en-US")} ${draft.kind === "edition" ? "copies" : "items"}`} />
              <Row label="Starts" value={terms.startTime === 0 ? "At launch" : new Date(terms.startTime * 1000).toLocaleString()} />
              <Row label="Ends" value={terms.endTime === 0 ? "No end date" : new Date(terms.endTime * 1000).toLocaleString()} />
              <Row label="Per wallet" value={terms.maxPerWallet === "0" ? "No limit" : terms.maxPerWallet} />
              <Row label="Who can mint" value={list ? `${Object.keys(list.proofs).length} wallets on a list` : "Everyone"} />
              <p className="pt-1 text-xs text-muted-foreground">The artwork and these terms can't be changed after launch. You can change the list later.</p>
            </div>
            <GradientButton big onClick={() => void run()}>Launch drop</GradientButton>
          </>
        )}
        {step.kind === "uploading" && (
          <>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Loader2 className="h-4 w-4 animate-spin" />Uploading</h2>
            <p className="text-sm text-muted-foreground">{tasks.filter((t) => t.status === "done").length} of {tasks.length} files</p>
          </>
        )}
        {step.kind === "launching" && (
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Loader2 className="h-4 w-4 animate-spin" />Launching your drop…</h2>
        )}
        {step.kind === "error" && (
          <>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><XCircle className="h-4 w-4 text-destructive" />Not launched</h2>
            <p className="text-sm text-muted-foreground">{step.message}</p>
            {tasks.some((t) => t.status === "failed") && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {tasks.filter((t) => t.status === "failed").map((t) => <li key={t.id}>{t.file.name}: {t.error}</li>)}
              </ul>
            )}
            <Button onClick={() => void run()} className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" />Try again</Button>
          </>
        )}
        {step.kind === "done" && (
          <>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-green-500" />Your drop is live</h2>
            {step.warning && <p className="text-sm text-brand-orange">{step.warning}</p>}
            <div className="flex flex-wrap gap-2">
              <ShareButton title={draft.name} url={`${window.location.origin}${dropHref(step.collection)}`} variant="outline" />
              <Button asChild variant="outline"><a href={dropHref(step.collection)}>View drop</a></Button>
              {step.links.length > 0 && (
                <Button variant="outline" onClick={() => downloadCsv(popClaimLinksCsv(step.links), "claim-links.csv")}>Download claim links</Button>
              )}
            </div>
            {step.links.length > 0 && <p className="text-xs text-muted-foreground">Send each wallet its link — the link is what lets it mint.</p>}
          </>
        )}
      </div>
    </ActionDialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;
}

export function downloadCsv(csv: string, name: string) {
  const href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href, download: name }).click();
  URL.revokeObjectURL(href);
}
