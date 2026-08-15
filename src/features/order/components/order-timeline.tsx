"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";

import { statusLabel, type TimelineEntry } from "../types";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderTimelineProps {
  entries: TimelineEntry[];
  isLoading?: boolean;
}

/**
 * How the order reached its current status.
 *
 * Rendered as an ordered list, newest first, because that is what it is: a
 * sequence. A stack of divs would look identical and tell a screen reader
 * nothing about the ordering or the count.
 *
 * An entry with no actor is a transition no person made -- a payment callback
 * or a scheduled job. Naming it "Sistem" is honest; attributing it to whoever
 * happens to be signed in would not be.
 */
export function OrderTimeline({ entries, isLoading }: OrderTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">Memuat riwayat status…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada perubahan status yang tercatat. Pesanan yang dibuat sebelum
        fitur riwayat ini aktif tidak punya catatan lama.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="border-border border-l-2 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={entry.toStatus} />
            {entry.fromStatus ? (
              <span className="text-muted-foreground text-xs">
                dari {statusLabel(entry.fromStatus)}
              </span>
            ) : null}
          </div>

          <p className="text-muted-foreground mt-1 text-xs">
            {formatDateTime(entry.createdAt)} &middot;{" "}
            {entry.actorName || "Sistem"}
          </p>

          {entry.reason ? (
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Alasan: </span>
              {entry.reason}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
