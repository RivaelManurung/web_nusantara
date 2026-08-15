"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "./api";

const KEY = "dashboard";

export const dashboardKeys = {
  all: [KEY] as const,
  summary: [KEY, "summary"] as const,
  trend: (days: number) => [KEY, "trend", days] as const,
  anomalies: [KEY, "anomalies"] as const,
};

/**
 * Today's headline figures.
 *
 * Short staleTime: this is the screen somebody leaves open all morning, and a
 * cached "0 pesanan hari ini" from 8am is worse than a brief spinner.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: () => dashboardApi.summary(),
    staleTime: 30_000,
  });
}

export function useSalesTrend(days: number) {
  return useQuery({
    queryKey: dashboardKeys.trend(days),
    queryFn: () => dashboardApi.trend(days),
    // Yesterday and before cannot change; only today's bar can.
    staleTime: 5 * 60_000,
  });
}

/**
 * The review queue.
 *
 * Held longer than the summary: these rules scan the whole customer base, and
 * an account that looks suspicious now will still look suspicious in five
 * minutes. Nobody is waiting on this number to change.
 */
export function useAnomalies() {
  return useQuery({
    queryKey: dashboardKeys.anomalies,
    queryFn: () => dashboardApi.anomalies(),
    staleTime: 5 * 60_000,
  });
}
