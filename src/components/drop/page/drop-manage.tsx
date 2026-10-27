"use client";

import { useState } from "react";
import { buildPopAllowlist, dropClaimLinks, popClaimLinksCsv, type DropOnchain } from "@medialane/sdk/starknet";
import { dropHref, type ApiDrop, type ApiDropMint } from "@medialane/sdk";
import { ActionDialog } from "../../action-dialog.js";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { Textarea } from "../../textarea.js";
import { ShareButton } from "../../share-button.js";
import { StatTile } from "../../stat-tile.js";
import { DropActivityList } from "./drop-activity.js";
import { ExclusiveFields, type ExclusiveValue } from "../create/exclusive-fields.js";
import { downloadCsv } from "../create/launch-dialog.js";
import { describeError } from "../../../utils/describe-error.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { priceLabel, supplyLabel } from "../../../utils/drop/sale.js";

export interface DropManageProps {
  contract: string;
  indexed: ApiDrop | null;
  onchain: DropOnchain;
  mints: ApiDropMint[];
  /** Runs a manage action as one transaction; resolves when confirmed. */
  run: (params: { action: "issue"; recipient: string; quantity: string } | { action: "set_allowlist_root"; root: string }) => Promise<void>;
  saveExclusive: (value: ExclusiveValue | null) => Promise<void>;
}

type Pending = { title: string; body: string; act: () => Promise<void> } | null;

export function DropManage({ contract, indexed, onchain, mints, run, saveExclusive }: DropManageProps) {
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [listText, setListText] = useState("");
  const [links, setLinks] = useState<ReturnType<typeof dropClaimLinks>>([]);
  const [gift, setGift] = useState({ to: "", quantity: "1" });
  const [exclusive, setExclusive] = useState<ExclusiveValue>({ title: "", url: "", type: "" });
  const listed = BigInt(onchain.allowlistRoot) !== 0n;
  const left = onchain.maxSupply === 0n ? null : onchain.maxSupply - onchain.totalMinted;
  const shareUrl = typeof window === "undefined" ? dropHref(contract) : `${window.location.origin}${dropHref(contract)}`;

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await pending.act();
      setMessage(`${pending.title} — done.`);
    } catch (err) {
      setMessage(describeError(err).message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const parsed = parseAllowlist(listText);
  const list = parsed.addresses.length > 0 ? buildPopAllowlist(parsed.addresses) : null;
  const sameList = list !== null && BigInt(list.root) === BigInt(onchain.allowlistRoot);

  return (
    <div className="space-y-8">
      {message && <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm">{message}</p>}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Overview</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Minted" value={supplyLabel(onchain.totalMinted.toString(), onchain.maxSupply.toString())} />
          <StatTile label="Revenue" value={priceLabel(indexed?.revenue ?? "0", onchain.paymentToken)} />
          <StatTile label="Collectors" value={indexed?.collectors ?? 0} />
        </div>
        <DropActivityList mints={mints} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Who can mint</h3>
        <p className="text-sm text-muted-foreground">{listed ? "Only wallets on your list can mint." : "Everyone can mint."}</p>
        <Textarea rows={5} placeholder="Paste wallet addresses, one per line" value={listText} onChange={(e) => { setListText(e.target.value); setLinks([]); }} />
        {parsed.invalid.length > 0 && <p className="text-xs text-destructive">{parsed.invalid.length} line(s) aren't wallet addresses: {parsed.invalid.slice(0, 3).join(", ")}</p>}
        <div className="flex flex-wrap gap-2">
          {list && sameList && (
            <Button variant="outline" onClick={() => setLinks(dropClaimLinks(window.location.origin, contract, list))}>This is your current list — get its claim links</Button>
          )}
          {list && !sameList && parsed.invalid.length === 0 && (
            <Button onClick={() => setPending({
              title: "List published",
              body: `Only these ${parsed.addresses.length} wallets will be able to mint. Claim links for your previous list stop working for wallets not on this one.`,
              act: async () => { await run({ action: "set_allowlist_root", root: list.root }); setLinks(dropClaimLinks(window.location.origin, contract, list)); },
            })}>Publish this list</Button>
          )}
          {listed && (
            <Button variant="outline" onClick={() => setPending({
              title: "Drop opened to everyone",
              body: "Anyone will be able to mint, with or without a claim link.",
              act: () => run({ action: "set_allowlist_root", root: "0x0" }),
            })}>Open to everyone</Button>
          )}
          {links.length > 0 && <Button variant="outline" onClick={() => downloadCsv(popClaimLinksCsv(links), "claim-links.csv")}>Download claim links</Button>}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Gift</h3>
        <p className="text-sm text-muted-foreground">
          Mint free tokens to a wallet{left !== null ? ` · ${left.toString()} left` : ""}. Gifts don't count toward that wallet's limit.
        </p>
        <div className="flex gap-2">
          <Input placeholder="Wallet address" value={gift.to} onChange={(e) => setGift({ ...gift, to: e.target.value.trim() })} />
          <Input className="w-20" inputMode="numeric" value={gift.quantity} onChange={(e) => setGift({ ...gift, quantity: e.target.value.trim() })} />
        </div>
        <Button
          disabled={parseAllowlist(gift.to).addresses.length !== 1 || !/^[1-9]\d*$/.test(gift.quantity)}
          onClick={() => setPending({
            title: "Gift sent",
            body: `Mint ${gift.quantity} free token(s) to ${gift.to}.`,
            act: () => run({ action: "issue", recipient: gift.to, quantity: gift.quantity }),
          })}
        >Send gift</Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Share</h3>
        <div className="flex gap-2">
          <Input readOnly value={shareUrl} />
          <ShareButton title={indexed?.name ?? "Drop"} url={shareUrl} variant="outline" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Exclusive content</h3>
        <ExclusiveFields value={exclusive} onChange={setExclusive} />
        <div className="flex gap-2">
          <Button disabled={!/^https:\/\//.test(exclusive.url)} onClick={() => setPending({ title: "Exclusive content saved", body: "Holders will see this link.", act: () => saveExclusive(exclusive) })}>Save</Button>
          <Button variant="outline" onClick={() => setPending({ title: "Exclusive content removed", body: "Holders will no longer see a link.", act: () => saveExclusive(null) })}>Remove</Button>
        </div>
      </section>

      <ActionDialog open={pending !== null} onClose={() => !busy && setPending(null)} width={460}>
        <div className="space-y-4 p-6">
          <p className="text-sm">{pending?.body}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setPending(null)}>Cancel</Button>
            <Button disabled={busy} onClick={() => void confirm()}>{busy ? "Working…" : "Confirm"}</Button>
          </div>
        </div>
      </ActionDialog>
    </div>
  );
}
