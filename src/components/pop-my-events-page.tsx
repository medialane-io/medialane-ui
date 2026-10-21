"use client";

import { Award, Plus, Settings } from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import Image from "./image.js";
import Link from "./link.js";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { SignInPrompt } from "./sign-in-prompt.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useMyPopEvents } from "../utils/use-pop.js";

function MyEventCard({ collection }: { collection: ApiCollection }) {
  const imageUrl = useImageUrl()(collection.image, { width: 128 });
  const initial = (collection.name ?? "E").charAt(0).toUpperCase();

  return (
    <div className="bento-cell overflow-hidden flex gap-4 p-4 items-center">
      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0">
        {imageUrl ? (
          <Image src={imageUrl} alt={collection.name ?? "Event"} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/40 to-green-900/50 flex items-center justify-center">
            <span className="text-2xl font-black text-white/20">{initial}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-bold text-sm truncate">{collection.name ?? "Unnamed Event"}</p>
        {collection.symbol && (
          <p className="text-xs text-muted-foreground">{collection.symbol}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {(collection.totalSupply ?? 0).toLocaleString()} claimed
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild variant="outline" size="sm">
          <Link href={`/launchpad/pop/${collection.contractAddress}/manage`}>
            <Settings className="h-3.5 w-3.5 mr-1" />
            Manage
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function PopMyEventsPage() {
  const { walletAddress, walletLoading } = useMedialaneApp();
  const { events: collections, isLoading } = useMyPopEvents(walletAddress);

  if (!walletAddress) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-24 pb-8">
        {walletLoading ? <Skeleton className="h-40 w-full rounded-xl" /> : (
          <SignInPrompt icon={<Award className="h-10 w-10 text-muted-foreground/20" />} title="Sign in to see your events" />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-16 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <span className="pill-badge inline-flex gap-1.5 mb-2">
              <Award className="h-3 w-3" />
              POP Protocol
            </span>
            <h1 className="text-2xl font-bold mt-1">My Events</h1>
            <p className="text-sm text-muted-foreground">Events you&apos;ve created</p>
          </div>
          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
            <Link href="/launchpad/pop/create">
              <Plus className="h-3.5 w-3.5" />
              New event
            </Link>
          </Button>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !collections || collections.length === 0 ? (
        <FadeIn>
          <div className="bento-cell border-dashed p-16 text-center space-y-3">
            <Award className="h-10 w-10 text-muted-foreground/20 mx-auto" />
            <p className="text-sm text-muted-foreground">No events yet</p>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
              <Link href="/launchpad/pop/create">
                <Plus className="h-3.5 w-3.5" />
                Create your first event
              </Link>
            </Button>
          </div>
        </FadeIn>
      ) : (
        <Stagger className="space-y-3">
          {collections.map((col) => (
            <StaggerItem key={col.contractAddress}>
              <MyEventCard collection={col} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
