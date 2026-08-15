"use client";

import { Plus, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format";

import { useBroadcasts } from "../queries";
import {
  audienceLabel,
  channelLabel,
  deliverySummary,
  type Broadcast,
} from "../types";

/**
 * "Notifikasi": what has been sent, with the way to send another.
 *
 * This screen used to be the compose form itself, which made the section
 * inconsistent with every other one in the panel -- Banner, Event, Voucher and
 * Produk all open on a list with a "Tambah" button -- and left an operator with
 * no way to see what had already gone out.
 *
 * Rendered as cards rather than a table on purpose. A notification is a piece
 * of writing: the title and body are the point, and they do not survive being
 * squeezed into two columns beside four counters.
 */
export function NotificationHistoryPage() {
  const [page, setPage] = useState(1);
  const query = useBroadcasts(page);

  const rows = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Riwayat pengumuman dan promo yang pernah dikirim ke aplikasi pelanggan."
        actions={
          <Button size="sm" render={<Link href={ROUTES.notificationNew} />}>
            <Plus className="size-4" aria-hidden />
            Buat notifikasi
          </Button>
        }
      />

      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {query.error instanceof ApiError
              ? query.error.message
              : "Gagal memuat riwayat notifikasi."}
          </AlertDescription>
        </Alert>
      ) : null}

      {query.isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <span className="sr-only">Memuat riwayat notifikasi…</span>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : null}

      {!query.isLoading && rows.length === 0 && !query.error ? (
        <EmptyState />
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((broadcast) => (
            <li key={broadcast.id}>
              <BroadcastCard broadcast={broadcast} />
            </li>
          ))}
        </ul>
      ) : null}

      {query.data && rows.length > 0 ? (
        <Pagination
          pagination={query.data.pagination}
          onPageChange={setPage}
          isLoading={query.isFetching}
        />
      ) : null}
    </div>
  );
}

function BroadcastCard({ broadcast }: { broadcast: Broadcast }) {
  // A send that reached nobody's phone when push was asked for is the one row
  // an operator must not scroll past.
  const pushTrouble =
    broadcast.pushRequested &&
    (!broadcast.pushEnabled || broadcast.pushFailed > 0);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-medium">{broadcast.title || "-"}</p>
            {broadcast.body ? (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {broadcast.body}
              </p>
            ) : null}
          </div>

          <Badge variant="secondary">{channelLabel(broadcast.channel)}</Badge>
        </div>

        <dl className="text-muted-foreground grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Dikirim" value={formatDateTime(broadcast.createdAt)} />
          <Fact
            label="Penerima"
            value={`${audienceLabel(broadcast.audienceMode)} · ${broadcast.recipientCount}`}
          />
          <Fact label="Push" value={deliverySummary(broadcast)} />
          <Fact label="Oleh" value={broadcast.actorName || "Sistem"} />
        </dl>

        {pushTrouble ? (
          <Alert>
            <Send className="size-4" aria-hidden />
            <AlertDescription>
              {broadcast.pushEnabled
                ? `Notifikasi tersimpan di inbox, tetapi ${broadcast.pushFailed} perangkat gagal dibangunkan.`
                : "Notifikasi tersimpan di inbox saja — push belum aktif di server saat itu."}
              {broadcast.pushError ? ` ${broadcast.pushError}` : ""}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <Send className="text-muted-foreground size-8" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium">Belum ada notifikasi yang dikirim</p>
          <p className="text-muted-foreground text-sm">
            Pengumuman dan promo yang Anda kirim akan tercatat di sini.
          </p>
        </div>
        <Button size="sm" render={<Link href={ROUTES.notificationNew} />}>
          <Plus className="size-4" aria-hidden />
          Buat notifikasi
        </Button>
      </CardContent>
    </Card>
  );
}
