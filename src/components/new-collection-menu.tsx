"use client";

import { Layers, Plus, Sparkles, type LucideIcon } from "lucide-react";
import Link from "./link.js";
import { Button } from "./button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu.js";

interface CollectionType {
  id: "single" | "multi";
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}

export const COLLECTION_TYPES: readonly CollectionType[] = [
  {
    id: "single",
    label: "Single edition",
    description: "Each piece is one of a kind",
    href: "/launchpad/single-editions/collection",
    Icon: Sparkles,
  },
  {
    id: "multi",
    label: "Multi edition",
    description: "Each piece can have many copies",
    href: "/launchpad/nfteditions/create",
    Icon: Layers,
  },
];

export function NewCollectionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New collection
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {COLLECTION_TYPES.map(({ id, label, description, href, Icon }) => (
          <DropdownMenuItem key={id} asChild>
            <Link href={href} className="flex items-start gap-3 p-2">
              <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CollectionTypeChoices() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 max-w-xl mx-auto text-left">
      {COLLECTION_TYPES.map(({ id, label, description, href, Icon }) => (
        <Link
          key={id}
          href={href}
          className="flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
        >
          <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
