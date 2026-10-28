"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Flag, Loader2, MessageCircle, Send, Zap } from "lucide-react";
import { normalizeAddress, profileHref, STARKNET_NFTCOMMENTS_CONTRACT } from "@medialane/sdk";
import { AddressDisplay } from "./address-display.js";
import { Button } from "./button.js";
import Link from "./link.js";
import { useMedialaneApp, type ReportTarget } from "./medialane-app.js";
import { RewardEarned } from "./rewards/reward-earned.js";
import { Skeleton } from "./skeleton.js";
import { Textarea } from "./textarea.js";
import { TransactionDialog } from "./transaction-dialog.js";
import { TransactionSuccess } from "./transaction-success.js";
import { cn } from "../utils/cn.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { timeAgo } from "../utils/time.js";
import { successMessages } from "../utils/success-messages.js";
import { useComments } from "../utils/use-comments.js";
import { useTransaction } from "../utils/use-transaction.js";

const MAX_LEN = 1000;

export interface CommentsSectionProps {
  contract: string;
  tokenId: string;
  className?: string;
}

export function CommentsSection({ contract, tokenId, className }: CommentsSectionProps) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const hasWallet = !!walletAddress;
  const { ReportDialog } = app;
  const { comments, isLoading, mutate } = useComments(contract, tokenId);
  const tx = useTransaction();

  const [text, setText] = useState("");
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);

  const byteLen = new TextEncoder().encode(text).length;
  const canSubmit = text.trim().length > 0 && byteLen <= MAX_LEN && !!STARKNET_NFTCOMMENTS_CONTRACT;
  const isProcessing = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  const isOwn = (author: string) =>
    !!walletAddress && normalizeAddress("STARKNET", author) === normalizeAddress("STARKNET", walletAddress);

  const isNearBottom = () => {
    const el = messagesRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

  }, [comments.length]);

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit && !isProcessing) {
      e.preventDefault();
      post();
    }
  };

  const post = () => {
    const body = text.trim();
    void tx
      .run(async (signer) => {
        await runIntentCalls(signer, () =>
          app.getClient().api.intents.create("comment", { author: signer.address, nftContract: contract, tokenId, text: body }),
        );
      })
      .then((ok) => {
        if (!ok) return;
        setText("");
        if (composeRef.current) composeRef.current.style.height = "auto";
        void mutate();
      });
  };

  const handleStartConversation = () => {
    if (hasWallet) composeRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col h-[480px] overflow-hidden", className)}>

      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {([
              { own: false, w: "w-40" },
              { own: true,  w: "w-56" },
              { own: false, w: "w-48" },
              { own: true,  w: "w-32" },
            ] as const).map((item, i) => (
              <div key={i} className={`flex ${item.own ? "justify-end" : "justify-start"} gap-2`}>
                {!item.own && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                <Skeleton
                  className={`h-10 ${item.w} rounded-2xl ${item.own ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue) / 0.15), hsl(var(--brand-purple) / 0.15))" }}>
              <MessageCircle className="h-7 w-7" style={{ color: "hsl(var(--brand-blue))" }} />
            </div>
            <div>
              <p className="text-sm font-semibold">Nothing here yet</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[220px]">
                Your comment will be minted onchain — attached to this NFT forever.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleStartConversation}
              className="rounded-full text-white px-5"
              style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue)), hsl(var(--brand-purple)))" }}
            >
              Write the first comment
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => {
              const own = isOwn(comment.author);
              const avatarSeed = parseInt(comment.author.slice(2, 8), 16) % 360;
              const avatarBg = own
                ? "linear-gradient(135deg, hsl(var(--brand-blue)), hsl(var(--brand-purple)))"
                : `linear-gradient(135deg, hsl(${avatarSeed}, 65%, 45%), hsl(${(avatarSeed + 60) % 360}, 65%, 55%))`;

              return (
                <div
                  key={comment.id}
                  className={`group flex gap-2.5 ${own ? "flex-row-reverse" : "flex-row"}`}
                >

                  <Link href={profileHref({ address: comment.author })} className="shrink-0 mt-0.5">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-2xs font-bold text-white select-none ring-2 ring-background hover:ring-primary/40 transition-all"
                      style={{ background: avatarBg }}
                    >
                      {comment.author.slice(2, 5).toUpperCase()}
                    </div>
                  </Link>

                  <div className={`flex flex-col max-w-[75%] gap-1 ${own ? "items-end" : "items-start"}`}>

                    <div className={`flex items-center gap-2 px-1 ${own ? "flex-row-reverse" : "flex-row"}`}>
                      <Link
                        href={profileHref({ address: comment.author })}
                        className="text-xs font-semibold text-foreground hover:underline underline-offset-2"
                      >
                        {own ? "You" : <AddressDisplay address={comment.author} chars={5} showCopy={false} />}
                      </Link>
                      <span className="text-2xs text-muted-foreground" title={comment.postedAt}>
                        {timeAgo(comment.postedAt)}
                      </span>
                    </div>

                    <div className="relative">
                      {own ? (
                        <div
                          className="px-3.5 py-2.5 text-sm leading-relaxed break-words rounded-2xl rounded-tr-sm text-white"
                          style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue)), hsl(var(--brand-purple)))" }}
                        >
                          {comment.content}
                        </div>
                      ) : (
                        <div className="px-3.5 py-2.5 text-sm leading-relaxed break-words bg-muted rounded-2xl rounded-tl-sm border border-border/50">
                          {comment.content}
                        </div>
                      )}
                      {!own && hasWallet && (
                        <button
                          className="absolute -top-1 -right-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive/70"
                          title="Report comment"
                          aria-label="Report comment"
                          onClick={() => setReportTarget({ type: "COMMENT", commentId: comment.id })}
                        >
                          <Flag className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {comment.txHash && (
                      <a
                        href={`${EXPLORER_URL}/tx/${comment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-1 text-2xs font-medium transition-colors"
                        style={{ color: "hsl(var(--brand-blue) / 0.55)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--brand-blue))")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--brand-blue) / 0.55)")}
                      >
                        <span>⛓</span>
                        <span>onchain proof</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border/60 shrink-0">
        {!hasWallet ? (
          <div className="flex items-center justify-center px-4 h-16">
            <button type="button" onClick={app.onRequireWallet} className="text-sm text-primary hover:underline">
              {app.connectLabel ?? "Connect"} to comment
            </button>
          </div>
        ) : (
          <div className="px-3 pt-2 pb-3 space-y-2">

            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" style={{ color: "hsl(var(--brand-blue))" }} />
              <span className="text-2xs font-semibold" style={{ color: "hsl(var(--brand-blue))" }}>
                Mint your message onchain
              </span>
            </div>

            <div
              className="rounded-xl border bg-background/60 transition-all focus-within:ring-2"
              style={{
                borderColor: "hsl(var(--border))",
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--brand-blue) / 0.6)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px hsl(var(--brand-blue) / 0.12)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--border))";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              }}
            >
              <Textarea
                ref={composeRef}
                placeholder="Say something onchain… it's permanent."
                value={text}
                onChange={handleTextInput}
                onKeyDown={handleKeyDown}
                rows={2}
                className="resize-none min-h-[52px] max-h-[120px] w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 pt-2.5 pb-1 text-sm rounded-xl"
                disabled={isProcessing}
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <span className="text-2xs text-muted-foreground/40 flex items-center gap-1">
                  Enter ↵ to post
                </span>
                <div className="flex items-center gap-2">
                  {byteLen > 800 && (
                    <span className={`text-2xs ${byteLen > MAX_LEN ? "text-destructive" : "text-muted-foreground"}`}>
                      {byteLen}/{MAX_LEN}
                    </span>
                  )}
                  <button
                    onClick={post}
                    disabled={!canSubmit || isProcessing}
                    className="flex items-center gap-1.5 h-7 px-3 text-xs font-semibold rounded-full text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue)), hsl(var(--brand-purple)))" }}
                  >
                    {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    Post onchain
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {reportTarget && ReportDialog && (
        <ReportDialog
          target={reportTarget}
          open={!!reportTarget}
          onOpenChange={(open) => { if (!open) setReportTarget(null); }}
        />
      )}

      <TransactionDialog tx={tx} title="Comment" workingLabel="Posting your comment…" firstStepLabel="Prepare comment">
        <TransactionSuccess
          name="Comment"
          {...successMessages.commented()}
          txHash={tx.txHash}
          actions={[{ label: "Done", onClick: tx.reset }]}
        >
          <RewardEarned actionType="comment" />
        </TransactionSuccess>
      </TransactionDialog>
    </div>
  );
}
