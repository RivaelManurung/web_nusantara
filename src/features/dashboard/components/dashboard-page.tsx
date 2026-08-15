"use client";

import {
  ClipboardList,
  ShieldAlert,
  TriangleAlert,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";

import { useAnomalies, useDashboardSummary, useSalesTrend } from "../queries";
import {
  changeAgainstYesterday,
  ruleLabel,
  type Anomaly,
  type Summary,
  type TrendPoint,
} from "../types";

const TREND_DAYS = 14;

/**
 * The dashboard.
 *
 * Every figure here used to be a hardcoded constant, with an Alert on screen
 * admitting so. They now come from /dashboard/summary, /trend and /anomalies.
 *
 * The layout answers two questions in order: "what needs doing" first, then
 * "how are we doing". That ordering is deliberate -- a stuck order costs money
 * this morning, whereas yesterday's revenue is context.
 */
export function DashboardPage() {
  const name = useAuthStore((state) => state.profile?.name);

  const summaryQuery = useDashboardSummary();
  const trendQuery = useSalesTrend(TREND_DAYS);
  const anomalyQuery = useAnomalies();

  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          name
            ? `Selamat datang kembali, ${name}.`
            : "Ringkasan aktivitas toko."
        }
      />

      {summaryQuery.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {summaryQuery.error instanceof ApiError
              ? summaryQuery.error.message
              : "Gagal memuat ringkasan dasbor."}
          </AlertDescription>
        </Alert>
      ) : null}

      {summary ? <NeedsAttention summary={summary} /> : null}

      {summaryQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : null}

      {summary ? <StatCards summary={summary} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Penjualan {TREND_DAYS} hari terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendQuery.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <TrendChart points={trendQuery.data ?? []} />
            )}
          </CardContent>
        </Card>

        <AnomalyCard
          anomalies={anomalyQuery.data ?? []}
          isLoading={anomalyQuery.isLoading}
          error={anomalyQuery.error}
        />
      </div>
    </div>
  );
}

/**
 * The worklist, above the scoreboard.
 *
 * Rendered only when there is something to do: a permanent "0 pesanan tertahan"
 * panel trains people to ignore the space where the real warning will appear.
 */
function NeedsAttention({ summary }: { summary: Summary }) {
  if (summary.stalledOrders === 0 && summary.awaitingAction === 0) return null;

  return (
    <Alert>
      <TriangleAlert className="size-4" aria-hidden />
      <AlertDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>
          {summary.awaitingAction > 0
            ? `${summary.awaitingAction} pesanan menunggu diproses toko`
            : null}
          {summary.awaitingAction > 0 && summary.stalledOrders > 0 ? ", " : null}
          {summary.stalledOrders > 0
            ? `${summary.stalledOrders} pesanan tertahan lebih dari dua jam`
            : null}
          .
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          render={<Link href={ROUTES.orders} />}
        >
          Buka daftar pesanan
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function StatCards({ summary }: { summary: Summary }) {
  const orderChange = changeAgainstYesterday(
    summary.ordersToday,
    summary.ordersYesterday,
  );
  const revenueChange = changeAgainstYesterday(
    summary.revenueToday,
    summary.revenueYesterday,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Pesanan hari ini"
        value={summary.ordersToday.toLocaleString("id-ID")}
        change={orderChange}
        icon={ClipboardList}
      />
      <Stat
        label="Pendapatan hari ini"
        value={formatCurrency(summary.revenueToday)}
        change={revenueChange}
        icon={Wallet}
      />
      <Stat
        label="Pelanggan baru"
        value={summary.newCustomers.toLocaleString("id-ID")}
        icon={UserPlus}
      />
      <Stat
        label="Perlu diproses"
        value={summary.awaitingAction.toLocaleString("id-ID")}
        hint={`Per ${formatDate(summary.date)}`}
        icon={TriangleAlert}
      />
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  change?: number | null;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}

function Stat({ label, value, change, hint, icon: Icon }: StatProps) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Icon className="size-4" />
          {label}
        </div>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {/* No comparison is shown when there is nothing to compare against --
            "+100%" from a day with zero orders is noise dressed as insight. */}
        {change !== null && change !== undefined ? (
          <p
            className={`text-xs tabular-nums ${
              change >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(0)}% dari kemarin
          </p>
        ) : hint ? (
          <p className="text-muted-foreground text-xs">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * The sales series, as plain bars.
 *
 * Deliberately not a charting library: fourteen values need a scale and
 * fourteen rectangles, and every bar carries its figure as text so the shape is
 * a convenience rather than the only way to read it.
 */
function TrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada penjualan pada rentang ini.
      </p>
    );
  }

  const peak = Math.max(...points.map((point) => point.revenue), 1);

  return (
    <ol className="flex h-48 items-end gap-1">
      {points.map((point) => {
        const height = Math.max((point.revenue / peak) * 100, 2);
        return (
          <li
            key={point.date}
            className="flex h-full flex-1 flex-col justify-end"
            title={`${point.date}: ${point.orders} pesanan, ${formatCurrency(point.revenue)}`}
          >
            <div
              className="bg-primary/70 hover:bg-primary rounded-t transition-colors"
              style={{ height: `${height}%` }}
            />
            <span className="sr-only">
              {point.date}: {point.orders} pesanan,{" "}
              {formatCurrency(point.revenue)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function AnomalyCard({
  anomalies,
  isLoading,
  error,
}: {
  anomalies: Anomaly[];
  isLoading: boolean;
  error: unknown;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="size-4" aria-hidden />
          Perlu ditinjau
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <p className="text-muted-foreground text-sm">
            {error instanceof ApiError
              ? error.message
              : "Gagal memuat daftar tinjauan."}
          </p>
        ) : null}

        {isLoading ? <Skeleton className="h-32 w-full" /> : null}

        {!isLoading && !error && anomalies.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tidak ada akun yang perlu ditinjau saat ini.
          </p>
        ) : null}

        {anomalies.length > 0 ? (
          <>
            {/* Stated once, plainly: these rules are coarse and are meant to
                start a check, not end one. */}
            <p className="text-muted-foreground text-xs">
              Ini petunjuk untuk diperiksa, bukan bukti pelanggaran.
            </p>
            <ul className="space-y-3">
              {anomalies.slice(0, 8).map((anomaly) => (
                <li
                  key={`${anomaly.userId}-${anomaly.rule}`}
                  className="border-border border-l-2 pl-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`${ROUTES.customers}/${anomaly.userId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {anomaly.name || "Tanpa nama"}
                    </Link>
                    <Badge variant="secondary">{ruleLabel(anomaly.rule)}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {anomaly.detail}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
