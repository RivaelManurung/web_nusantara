"use client";

import { Coins, Percent, Truck, Wallet } from "lucide-react";
import { useState } from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";

import { useFinancialReport, useTopProducts } from "../queries";
import { statusLabel, type Granularity } from "../types";
import { useReportFilters } from "../use-report-filters";
import { ReportFilters } from "./report-filters";
import { RevenueChart } from "./revenue-chart";
import { SummaryCards, type SummaryStat } from "./summary-cards";
import { useTopProductColumns } from "./top-products-table";

/** How many best sellers the table shows; the API caps this at 50. */
const TOP_PRODUCT_LIMIT = 10;

/**
 * "Laporan Keuangan": revenue over time and what sold.
 *
 * Every figure here counts only orders the backend considers revenue -- paid
 * and beyond. Cancelled and rejected orders are visible on the transaction
 * report instead, where they belong.
 */
export function FinancialReportPage() {
  const { filters, rangeError, setFilters, reset } = useReportFilters();
  const [granularity, setGranularity] = useState<Granularity>("day");

  const reportQuery = useFinancialReport(filters, granularity);
  const topQuery = useTopProducts(filters, TOP_PRODUCT_LIMIT);

  const columns = useTopProductColumns();

  const totals = reportQuery.data?.totals;
  const stats: SummaryStat[] = totals
    ? [
        {
          label: "Pendapatan neto",
          value: formatCurrency(totals.net),
          hint: `${totals.orderCount.toLocaleString("id-ID")} pesanan`,
          icon: Wallet,
        },
        {
          label: "Penjualan bruto",
          value: formatCurrency(totals.gross),
          hint: "Sebelum diskon dan ongkir",
          icon: Coins,
        },
        {
          label: "Total diskon",
          value: formatCurrency(totals.discountEvent + totals.discountVoucher),
          hint: `Event ${formatCurrency(totals.discountEvent)} · Voucher ${formatCurrency(totals.discountVoucher)}`,
          icon: Percent,
        },
        {
          label: "Ongkos kirim",
          value: formatCurrency(totals.shipping),
          hint: "Ditagihkan ke pelanggan",
          icon: Truck,
        },
      ]
    : [];

  const error = reportQuery.error ?? topQuery.error;
  const countedStatuses = reportQuery.data?.revenueStatuses ?? [];

  return (
    <div className="space-y-6">
      <PageHeader description="Rekap keuangan per periode." />

      <ReportFilters
        filters={filters}
        rangeError={rangeError}
        onChange={setFilters}
        onReset={reset}
        granularity={granularity}
        onGranularityChange={setGranularity}
      />

      {rangeError ? null : error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Gagal memuat laporan keuangan."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <SummaryCards
            stats={stats}
            isLoading={reportQuery.isPending && !totals}
          />

          <RevenueChart
            points={reportQuery.data?.points ?? []}
            granularity={granularity}
            isLoading={reportQuery.isPending && !reportQuery.data}
          />

          <Card>
            <CardHeader>
              <CardTitle>Produk terlaris</CardTitle>
              <CardDescription>
                Berdasarkan jumlah terjual pada periode ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={topQuery.data ?? []}
                isLoading={topQuery.isPending}
                skeletonRows={5}
                emptyMessage="Belum ada produk terjual pada periode ini."
              />
            </CardContent>
          </Card>

          {countedStatuses.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              Pendapatan dihitung dari pesanan berstatus{" "}
              {countedStatuses.map(statusLabel).join(", ").toLowerCase()}.
              Pesanan draf, belum dibayar, ditolak toko, dan dibatalkan tidak
              dihitung.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
