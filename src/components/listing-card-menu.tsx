"use client";

import { useState } from "react";
import { ExternalLink, Flag, Layers, MoreHorizontal } from "lucide-react";
import { assetHref, collectionHref, type ApiOrder } from "@medialane/sdk";
import Link from "./link.js";
import { Button } from "./button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu.js";
import { useMedialaneApp } from "./medialane-app.js";

export function ListingCardMenu({ order }: { order: ApiOrder }) {
  const { ReportDialog } = useMedialaneApp();
  const [reportOpen, setReportOpen] = useState(false);
  const contract = order.nftContract ?? "";
  const tokenId = order.nftTokenId ?? "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-9 w-9 p-0 shrink-0 rounded-[9px]" onClick={(e) => e.preventDefault()} aria-label="More actions">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={assetHref("STARKNET", contract, tokenId)} className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              View asset
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={collectionHref("STARKNET", contract)} className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              View collection
            </Link>
          </DropdownMenuItem>
          {ReportDialog ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive" onClick={(e) => { e.preventDefault(); setReportOpen(true); }}>
                <Flag className="h-3.5 w-3.5" />
                Report
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {ReportDialog && reportOpen ? (
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} target={{ type: "TOKEN", contract, tokenId, name: order.token?.name ?? undefined }} />
      ) : null}
    </>
  );
}
