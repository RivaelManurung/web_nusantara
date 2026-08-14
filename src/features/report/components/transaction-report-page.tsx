"use client";

import { Ban, ClipboardList, Receipt, Wallet } from "lucide-react";
import { useCallback, useState } from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";

import { useTransactionReport, useTransactionSummary } from "../queries";
import { statusLabel, type ReportFilters as Filters } from "../types";
import { useReportFilters } from "../use-report-filters";
import { ReportFilters } from "./report-filters";
import { SummaryCards, type SummaryStat } from "./summary-cards";
import { useTransactionColumns } from "./transaction-report-table";

/**
 * "Laporan Transaksi": every order in a period, with the headline counts above.
 *
 * The summary is a separate request from the table on purpose. The figures
 * describe the whole period, which may be tens of thousands of orders; deriving
 * them from the twenty rows currently on screen would produce numbers that
 * change as you page through them.
 */
export function TransactionReportPage() {
  const { filters, rangeError, setFilters, reset } = useReportFilters();
  const [page, setPage] = useState(1);

  // Any filter change invalidates the current page: staying on page four of a
  // narrower result set shows an empty table that reads as "no transactions".
  const changeFilters = useCallback(
    (patch: Partial<Filters>) => {
      setFilters(patch);
      setPage(1);
    },
    [setFilters],
  );

  const resetFilters = useCallback(() => {
    reset();
    setPage(1);
  }, [reset]);

  const summaryQuery = useTransactionSummary(filters);
  const listQuery = useTransactionReport(filters, page);

  const columns = useTransactionColumns();

  const summary = summaryQuery.data;
  const stats: SummaryStat[] = summary
    ? [
        {
          label: "Total pesanan",
          value: summary.orderCount.toLocaleString("id-ID"),
          hint: "Semua status dalam periode ini",
          icon: ClipboardList,
        },
        {
          label: "Pesanan berpendapatan",
          value: summary.revenueOrderCount.toLocaleString("id-ID"),
          hint: "Sudah dibayar dan tidak dibatalkan",
          icon: Receipt,
        },
        {
          label: "Nilai pendapatan",
          value: formatCurrency(summary.revenueTotal),
          hint: "Hanya pesanan berpendapatan",
          icon: Wallet,
        },
        {
          label: "Nilai di luar pendapatan",
          value: formatCurrency(summary.total - summary.revenueTotal),
          hint: "Draf, belum dibayar, ditolak, dibatalkan",
          icon: Ban,
        },
      ]
    : [];

  const error = summaryQuery.error ?? listQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader description="Rekap transaksi per periode." />

      <ReportFilters
        filters={filters}
        rangeError={rangeError}
        onChange={changeFilters}
        onReset={resetFilters}
        showStatus
      />

      {rangeError ? null : error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Gagal memuat laporan transaksi."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <SummaryCards
            stats={stats}
            isLoading={summaryQuery.isPending && !summary}
          />

          {summary && summary.statuses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Rincian per status</CardTitle>
                <CardDescription>
                  Status yang tidak muncul berarti tidak ada pesanannya pada
                  periode ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {summary.statuses.map((row) => (
                    <li
                      key={row.status}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <Badge
                          variant={row.isRevenue ? "default" : "secondary"}
                        >
                          {statusLabel(row.status)}
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          {row.orderCount.toLocaleString("id-ID")} pesanan
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums">
                        {formatCurrency(row.total)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <DataTable
            columns={columns}
            data={listQuery.data?.items ?? []}
            isLoading={listQuery.isPending}
            skeletonRows={8}
            emptyMessage="Tidak ada transaksi pada periode dan filter ini."
          />

          {listQuery.data ? (
            <Pagination
              pagination={listQuery.data.pagination}
              onPageChange={setPage}
              isLoading={listQuery.isFetching}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
