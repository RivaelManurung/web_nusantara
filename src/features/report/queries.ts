"use client";

import { useQuery } from "@tanstack/react-query";

import { shopApi } from "@/features/shop/api";

import { reportApi } from "./api";
import type { Granularity, ReportFilters } from "./types";

const KEY = "reports";

export const reportKeys = {
  all: [KEY] as const,
  transactions: (filters: ReportFilters, page: number) =>
    [KEY, "transactions", filters, page] as const,
  summary: (filters: ReportFilters) => [KEY, "summary", filters] as const,
  financial: (filters: ReportFilters, granularity: Granularity) =>
    [KEY, "financial", filters, granularity] as const,
  topProducts: (filters: ReportFilters, limit: number) =>
    [KEY, "top-products", filters, limit] as const,
  shopOptions: [KEY, "shop-options"] as const,
};

/**
 * Reports are read-only and their inputs are explicit, so a period that has
 * already been fetched does not need refetching while the user tweaks another
 * control on the same screen.
 */
const STALE_TIME = 60 * 1000;

/** Whether the range is complete enough to ask the server. */
function isReady(filters: ReportFilters): boolean {
  return Boolean(filters.from && filters.to && filters.from <= filters.to);
}

export function useTransactionReport(filters: ReportFilters, page: number) {
  return useQuery({
    queryKey: reportKeys.transactions(filters, page),
    queryFn: () => reportApi.transactions(filters, page),
    enabled: isReady(filters),
    staleTime: STALE_TIME,
    // Keeps the current page visible while the next one loads, instead of
    // collapsing the table to a skeleton on every page change.
    placeholderData: (previous) => previous,
  });
}

export function useTransactionSummary(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.summary(filters),
    queryFn: () => reportApi.transactionSummary(filters),
    enabled: isReady(filters),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  });
}

export function useFinancialReport(
  filters: ReportFilters,
  granularity: Granularity,
) {
  return useQuery({
    queryKey: reportKeys.financial(filters, granularity),
    queryFn: () => reportApi.financial(filters, granularity),
    enabled: isReady(filters),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  });
}

export function useTopProducts(filters: ReportFilters, limit = 10) {
  return useQuery({
    queryKey: reportKeys.topProducts(filters, limit),
    queryFn: () => reportApi.topProducts(filters, limit),
    enabled: isReady(filters),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  });
}

/** How many pages of shops the filter will pull before giving up. */
const MAX_SHOP_PAGES = 5;

/**
 * Every shop, for the report filter.
 *
 * The shop list endpoint is paginated and has no "all" mode, so this walks a
 * bounded number of pages -- the same approach `useTypeProductOptions` takes in
 * the product feature. The cap keeps a large catalogue from turning one filter
 * dropdown into dozens of requests.
 */
export function useShopOptions() {
  return useQuery({
    queryKey: reportKeys.shopOptions,
    queryFn: async () => {
      const first = await shopApi.list({ page: 1 });
      const items = [...first.items];
      const pages = Math.min(first.pagination.total_pages, MAX_SHOP_PAGES);

      for (let page = 2; page <= pages; page += 1) {
        const next = await shopApi.list({ page });
        items.push(...next.items);
      }

      return items.map((shop) => ({ id: shop.id, name: shop.name }));
    },
    // Shops change rarely; refetching on every visit to the report is wasteful.
    staleTime: 5 * 60 * 1000,
  });
}
