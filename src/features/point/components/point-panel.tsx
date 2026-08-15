"use client";

import { Loader2, Scale, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";

import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format";

import { useAdjustPoints, usePointBalance, usePointHistory } from "../queries";
import {
  isReconciled,
  sourceLabel,
  type Balance,
  type PointDirection,
} from "../types";

/** Matches point.MaxReasonRunes and point.MaxAdjustment on the server. */
const MAX_REASON = 500;
const MAX_POINTS = 1_000_000;

/** The Select cannot hold an empty string, so "no filter" needs a sentinel. */
const ALL = "all";

/**
 * The Poin tab of a customer's detail.
 *
 * It shows two totals, not one. The server treats the ledger as the truth and
 * `user_points.total_points` as a cache, so this screen's job is to make a
 * disagreement between them visible -- that mismatch is the reported bug
 * ("poin tidak terupdate"), and hiding it behind a single number is how it went
 * unnoticed for so long.
 */
export function PointPanel({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const balanceQuery = usePointBalance(userId);
  const historyQuery = usePointHistory(userId, page, direction);
  const mutation = useAdjustPoints(userId);

  const balance = balanceQuery.data;
  const rows = historyQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      {balanceQuery.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {balanceQuery.error instanceof ApiError
              ? balanceQuery.error.message
              : "Gagal memuat saldo poin."}
          </AlertDescription>
        </Alert>
      ) : null}

      {balanceQuery.isLoading ? <Skeleton className="h-40 w-full" /> : null}

      {balance ? (
        <BalanceCard
          balance={balance}
          onAdjust={() => setAdjusting(true)}
          isPending={mutation.isPending}
        />
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Riwayat poin</CardTitle>
          <Select
            value={direction === "" ? ALL : direction}
            onValueChange={(next) => {
              setDirection(next === ALL ? "" : String(next));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter arah poin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua</SelectItem>
              <SelectItem value="in">Masuk</SelectItem>
              <SelectItem value="out">Keluar</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="space-y-4">
          {historyQuery.isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              <span className="sr-only">Memuat riwayat poin…</span>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {!historyQuery.isLoading && rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada pergerakan poin pada akun ini.
            </p>
          ) : null}

          {rows.length > 0 ? (
            <ul className="divide-border divide-y">
              {rows.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {sourceLabel(entry.source)}
                      </span>
                      {entry.isExpired ? (
                        <Badge variant="outline">Kedaluwarsa</Badge>
                      ) : null}
                    </div>
                    {entry.description ? (
                      <p className="text-muted-foreground text-sm">
                        {entry.description}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-medium tabular-nums ${
                      entry.direction === "in"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {entry.direction === "in" ? "+" : "−"}
                    {entry.points.toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {historyQuery.data && rows.length > 0 ? (
            <Pagination
              pagination={historyQuery.data.pagination}
              onPageChange={setPage}
              isLoading={historyQuery.isFetching}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Keyed so a draft never survives into the next correction. */}
      <AdjustDialog
        key={adjusting ? "open" : "closed"}
        open={adjusting}
        isPending={mutation.isPending}
        onCancel={() => setAdjusting(false)}
        onConfirm={(input) =>
          mutation.mutate(input, { onSuccess: () => setAdjusting(false) })
        }
      />
    </div>
  );
}

function BalanceCard({
  balance,
  onAdjust,
  isPending,
}: {
  balance: Balance;
  onAdjust: () => void;
  isPending: boolean;
}) {
  const reconciled = isReconciled(balance);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Saldo menurut ledger</p>
            <p className="text-3xl font-semibold tabular-nums">
              {balance.ledger.toLocaleString("id-ID")}
            </p>
            <p className="text-muted-foreground text-xs">
              dari {balance.entryCount.toLocaleString("id-ID")} pergerakan
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onAdjust}
          >
            <Scale className="size-4" aria-hidden />
            Koreksi manual
          </Button>
        </div>

        {reconciled ? (
          <p className="text-muted-foreground text-sm">
            Saldo tersimpan cocok dengan riwayatnya.
          </p>
        ) : (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" aria-hidden />
            <AlertTitle>Saldo tidak cocok dengan riwayat</AlertTitle>
            <AlertDescription>
              Saldo tersimpan {balance.cached.toLocaleString("id-ID")}, sedangkan
              riwayat berjumlah {balance.ledger.toLocaleString("id-ID")} —
              selisih {balance.drift.toLocaleString("id-ID")}. Riwayat adalah
              acuan yang benar. Jangan timpa saldonya diam-diam: catat koreksi
              beralasan supaya penyebabnya tetap bisa ditelusuri.
            </AlertDescription>
          </Alert>
        )}

        {balance.expiredInflow > 0 ? (
          <Alert>
            <AlertDescription>
              {balance.expiredInflow.toLocaleString("id-ID")} poin sudah lewat
              tanggal kedaluwarsa tetapi belum pernah ditarik dari saldo. Ini
              tanda proses kedaluwarsa poin belum berjalan.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface AdjustDialogProps {
  open: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: (input: {
    points: number;
    direction: PointDirection;
    reason: string;
  }) => void;
}

function AdjustDialog({
  open,
  isPending,
  onCancel,
  onConfirm,
}: AdjustDialogProps) {
  const [points, setPoints] = useState("");
  const [direction, setDirection] = useState<PointDirection>("in");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const fieldId = useId();

  const parsed = Number(points);
  const pointsError =
    !points || !Number.isFinite(parsed) || !Number.isInteger(parsed)
      ? "Isi jumlah poin sebagai bilangan bulat."
      : parsed <= 0
        ? "Jumlah harus lebih dari nol. Pakai arah untuk mengurangi."
        : parsed > MAX_POINTS
          ? `Maksimal ${MAX_POINTS.toLocaleString("id-ID")} poin per koreksi.`
          : null;

  const trimmed = reason.trim();
  const reasonError =
    trimmed === ""
      ? "Alasan wajib diisi untuk setiap koreksi."
      : trimmed.length > MAX_REASON
        ? `Alasan maksimal ${MAX_REASON} karakter.`
        : null;

  function submit() {
    setTouched(true);
    if (pointsError || reasonError) return;
    onConfirm({ points: parsed, direction, reason: trimmed });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Koreksi poin</DialogTitle>
          <DialogDescription>
            Koreksi dicatat sebagai pergerakan baru di riwayat, bukan menimpa
            saldo. Nama Anda dan alasannya ikut tersimpan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-direction`}>Arah</Label>
            <Select
              value={direction}
              onValueChange={(next) => setDirection(next as PointDirection)}
            >
              <SelectTrigger id={`${fieldId}-direction`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Menambah poin</SelectItem>
                <SelectItem value="out">Mengurangi poin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-points`}>Jumlah poin</Label>
            <Input
              id={`${fieldId}-points`}
              type="number"
              inputMode="numeric"
              min={1}
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={Boolean(touched && pointsError)}
              aria-describedby={
                touched && pointsError ? `${fieldId}-points-error` : undefined
              }
            />
            {touched && pointsError ? (
              <p
                id={`${fieldId}-points-error`}
                className="text-destructive text-sm"
              >
                {pointsError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-reason`}>Alasan</Label>
          <Textarea
            id={`${fieldId}-reason`}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(touched && reasonError)}
            aria-describedby={
              touched && reasonError ? `${fieldId}-reason-error` : undefined
            }
            placeholder="Contoh: kompensasi keluhan #4821"
          />
          {touched && reasonError ? (
            <p
              id={`${fieldId}-reason-error`}
              className="text-destructive text-sm"
            >
              {reasonError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isPending}>
                Batal
              </Button>
            }
          />
          <Button onClick={submit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Menyimpan…
              </>
            ) : (
              "Simpan koreksi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
