"use client";

import { useCallback, useMemo, useState } from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useOrders } from "../queries";
import {
  EMPTY_ORDER_FILTERS,
  isStalled,
  type OrderFilters as Filters,
  type OrderSummary,
} from "../types";
import { OrderFilters } from "./order-filters";
import { useOrderColumns } from "./order-table";

/**
 * "Pesanan": the worklist an operator works from.
 *
 * This screen replaced a NotBuiltYet placeholder. It is deliberately a worklist
 * rather than a second transaction report: the reports answer "what happened
 * over a period", this answers "what needs attention now", which is why the
 * stalled marker and the short cache live here and not there.
 */
export function OrderPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_ORDER_FILTERS);
  const [page, setPage] = useState(1);

  // Any filter change invalidates the current page: staying on page four of a
  // narrower result set shows an empty table that reads as "no orders".
  const changeFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_ORDER_FILTERS);
    setPage(1);
  }, []);

  // The API rejects an inverted range with a 422. Catching it here keeps the
  // screen from firing a request that can only fail.
  const rangeError = useMemo(() => {
    if (!filters.from || !filters.to) return null;
    return filters.to < filters.from
      ? "Tanggal akhir tidak boleh lebih awal dari tanggal mulai."
      : null;
  }, [filters.from, filters.to]);

  const query = useOrders(filters, page);

  const detailHref = useCallback(
    (row: OrderSummary) => `${ROUTES.orders}/${row.id}`,
    [],
  );
  const columns = useOrderColumns({ detailHref });

  const rows = useMemo(() => query.data?.items ?? [], [query.data]);
  const stalledCount = rows.filter(isStalled).length;

  return (
    <div className="space-y-6">
      <PageHeader description="Pesanan yang masuk ke toko Anda, terbaru lebih dulu." />

      <OrderFilters
        filters={filters}
        rangeError={rangeError}
        onChange={changeFilters}
        onReset={resetFilters}
      />

      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {query.error instanceof ApiError
              ? query.error.message
              : "Gagal memuat daftar pesanan."}
          </AlertDescription>
        </Alert>
      ) : null}

      {stalledCount > 0 ? (
        <Alert>
          <AlertDescription>
            {stalledCount} pesanan di halaman ini tertahan lebih dari dua jam di
            status yang sama.
          </AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={query.isLoading}
        emptyMessage="Belum ada pesanan yang cocok dengan filter ini."
        rowHref={detailHref}
      />

      {query.data ? (
        <Pagination
          pagination={query.data.pagination}
          onPageChange={setPage}
          isLoading={query.isFetching}
        />
      ) : null}
    </div>
  );
}
