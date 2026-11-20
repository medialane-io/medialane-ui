"use client";

import { Skeleton } from "./skeleton.js";
import { Button } from "./button.js";
import Link from "./link.js";
import { RefreshCw, AlertCircle } from "lucide-react";
import { ReactNode } from "react";
import { describeError } from "../utils/describe-error.js";
import { useT } from "../i18n/provider.js";
import { IconTile } from "./icon-tile.js";

interface EmptyOrErrorProps {
  isLoading: boolean;
  error?: unknown;
  isEmpty: boolean;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyCta?: { label: string; href: string };
  emptyActions?: ReactNode;
  emptyIcon?: ReactNode;
  skeletonCount?: number;

  skeletonNode?: ReactNode;
  children?: ReactNode;
}

export function EmptyOrError({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyCta,
  emptyActions,
  emptyIcon,
  skeletonCount = 4,
  skeletonNode,
  children,
}: EmptyOrErrorProps) {
  const t = useT();
  if (isLoading) {
    if (skeletonNode) return <>{skeletonNode}</>;
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center space-y-4">
        <IconTile size="lg" destructive className="mx-auto">
          <AlertCircle />
        </IconTile>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {describeError(error).message}
        </p>
        {onRetry && (
          <Button variant="soft" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {t("Try again")}
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-16 text-center space-y-4">
        {emptyIcon && (
          <IconTile size="lg" className="mx-auto">
            {emptyIcon}
          </IconTile>
        )}
        <p className="font-semibold text-lg">{t(emptyTitle)}</p>
        {emptyDescription && (
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t(emptyDescription)}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <Button variant="soft" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {t("Refresh")}
            </Button>
          )}
          {emptyCta && (
            <Button size="sm" asChild>
              <Link href={emptyCta.href}>{t(emptyCta.label)}</Link>
            </Button>
          )}
        </div>
        {emptyActions}
      </div>
    );
  }

  return <>{children}</>;
}
