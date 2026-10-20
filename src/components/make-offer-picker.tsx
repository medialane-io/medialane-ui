"use client";

import { useState } from "react";
import { Gavel, Search } from "lucide-react";
import type { ApiToken } from "@medialane/sdk";
import Image from "./image.js";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet.js";
import { useCollectionTokens } from "../utils/use-collections.js";
import { useImageUrl } from "../utils/use-image-url.js";

export function MakeOfferPicker({ contract, onPick }: { contract: string; onPick: (token: ApiToken) => void }) {
  const resolveImage = useImageUrl();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { tokens, isLoading } = useCollectionTokens(contract, 1, 60, "recent");

  const filtered = query.trim()
    ? tokens.filter((t) =>
        t.tokenId.includes(query.trim()) ||
        (t.metadata?.name ?? "").toLowerCase().includes(query.trim().toLowerCase())
      )
    : tokens;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Gavel className="h-3.5 w-3.5" />
        Make an offer
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-border shrink-0 space-y-3">
            <SheetTitle className="text-sm font-semibold">Choose an item to offer on</SheetTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or token ID"
                className="pl-8 h-9 text-xs"
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-2.5">
            {isLoading && tokens.length === 0
              ? Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)
              : filtered.map((t) => {
                  const image = resolveImage(t.metadata?.image);
                  return (
                    <button
                      key={`${t.contractAddress}-${t.tokenId}`}
                      onClick={() => { setOpen(false); onPick(t); }}
                      className="aspect-square rounded-lg overflow-hidden bg-muted relative group"
                    >
                      {image && (
                        <Image
                          src={image}
                          alt={t.metadata?.name ?? `#${t.tokenId}`}
                          fill
                          sizes="120px"
                          className="object-cover group-active:scale-95 transition-transform"
                          unoptimized
                        />
                      )}
                      <span className="absolute bottom-1 left-1 right-1 truncate text-[10px] font-semibold text-white drop-shadow">
                        {t.metadata?.name ?? `#${t.tokenId}`}
                      </span>
                    </button>
                  );
                })}
            {!isLoading && filtered.length === 0 && (
              <p className="col-span-3 text-center text-xs text-muted-foreground py-8">No items match &quot;{query}&quot;</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </>
  );
}
