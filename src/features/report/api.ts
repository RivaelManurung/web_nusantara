import { api } from "@/lib/api/client";
import type { Paginated } from "@/types/api";

import {
  toFinancialReport,
  toTopProduct,
  toTransaction,
  toTransactionSummary,
  type FinancialReport,
  type FinancialReportDto,
  type Granularity,
  type ReportFilters,
  type TopProduct,
  type TopProductDto,
  type Transaction,
  type TransactionDto,
  type TransactionSummary,
  type TransactionSummaryDto,
} from "./types";

const BASE = "/report";

/**
 * Serialises the filters.
 *
 * `from` and `to` are always sent -- the backend answers 422 without them,
 * deliberately, so that a report can never silently cover all of history. The
 * optional filters are omitted when empty rather than sent as `status=`, which
 * the handler would read as a request for the empty-string status.
 */
function toQuery(filters: ReportFilters): Record<string, string> {
  return {
    from: filters.from,
    to: filters.to,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.shopId ? { shop_id: filters.shopId } : {}),
    ...(filters.paymentMethod ? { payment_method: filters.paymentMethod } : {}),
  };
}

export const reportApi = {
  async transactions(
    filters: ReportFilters,
    page: number,
  ): Promise<Paginated<Transaction>> {
    const result = await api.getPaginated<TransactionDto>(
      `${BASE}/transactions`,
      { params: { ...toQuery(filters), page } },
    );

    return {
      items: result.items.map(toTransaction),
      pagination: result.pagination,
    };
  },

  async transactionSummary(
    filters: ReportFilters,
  ): Promise<TransactionSummary> {
    // The summary is the per-status breakdown, so the status filter is
    // deliberately dropped here -- the backend ignores it on this route too.
    const { from, to, shopId, paymentMethod } = filters;

    return toTransactionSummary(
      await api.get<TransactionSummaryDto>(`${BASE}/transactions/summary`, {
        params: toQuery({ from, to, shopId, paymentMethod }),
      }),
    );
  },

  async financial(
    filters: ReportFilters,
    granularity: Granularity,
  ): Promise<FinancialReport> {
    return toFinancialReport(
      await api.get<FinancialReportDto>(`${BASE}/financial`, {
        params: { ...toQuery(filters), granularity },
      }),
    );
  },

  async topProducts(
    filters: ReportFilters,
    limit: number,
  ): Promise<TopProduct[]> {
    const rows = await api.get<TopProductDto[] | null>(
      `${BASE}/financial/top-products`,
      { params: { ...toQuery(filters), limit } },
    );

    return (rows ?? []).map(toTopProduct);
  },
};
