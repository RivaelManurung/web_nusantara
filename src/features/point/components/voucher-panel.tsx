"use client";

import { TicketPercent } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";
import { formatDate, formatDateTime } from "@/lib/format";

import { useClaimedVouchers } from "../queries";

/**
 * The Voucher tab of a customer's detail.
 *
 * Claimed and used are shown as separate facts rather than one status. The gap
 * between them is the signal worth seeing: an account that claims steadily and
 * redeems nothing is the shape of promotion farming, and a single "punya
 * voucher" badge would flatten that into nothing.
 */
export function VoucherPanel({ userId }: { userId: string }) {
  const query = useClaimedVouchers(userId);
  const rows = query.data ?? [];

  const claimed = rows.length;
  const used = rows.filter((row) => row.isUsed).length;
  // Enough claims to be a pattern rather than a coincidence, and none redeemed.
  const hoarding = claimed >= 3 && used === 0;

  return (
    <div className="space-y-4">
      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {query.error instanceof ApiError
              ? query.error.message
              : "Gagal memuat voucher akun ini."}
          </AlertDescription>
        </Alert>
      ) : null}

      {query.isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-live="polite">
          <span className="sr-only">Memuat voucher…</span>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}

      {!query.isLoading && rows.length === 0 && !query.error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <TicketPercent
              className="text-muted-foreground size-7"
              aria-hidden
            />
            <p className="text-muted-foreground text-sm">
              Akun ini belum pernah mengklaim voucher.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <>
          <p className="text-muted-foreground text-sm">
            {claimed} voucher diklaim, {used} sudah dipakai.
          </p>

          {hoarding ? (
            <Alert>
              <AlertDescription>
                Akun ini mengklaim {claimed} voucher dan belum memakai satu pun.
                Pola ini layak diperiksa sebelum diambil tindakan.
              </AlertDescription>
            </Alert>
          ) : null}

          <ul className="space-y-2">
            {rows.map((voucher) => (
              <li key={voucher.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-mono text-sm font-medium">
                        {voucher.code || "-"}
                      </p>
                      {voucher.description ? (
                        <p className="text-muted-foreground text-sm">
                          {voucher.description}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground text-xs">
                        Diklaim {formatDateTime(voucher.claimedAt)}
                        {voucher.validUntil
                          ? ` · berlaku sampai ${formatDate(voucher.validUntil)}`
                          : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge variant={voucher.isUsed ? "default" : "secondary"}>
                        {voucher.isUsed ? "Sudah dipakai" : "Belum dipakai"}
                      </Badge>
                      {voucher.redeemedAt ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatDateTime(voucher.redeemedAt)}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
