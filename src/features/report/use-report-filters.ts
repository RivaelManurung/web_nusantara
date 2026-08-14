"use client";

import { useCallback, useMemo, useState } from "react";

import type { ReportFilters } from "./types";

/** Mirrors the backend's cap, so a doomed request is caught before it is sent. */
const MAX_RANGE_DAYS = 366;

/** The period the screens open on. */
const DEFAULT_RANGE_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** `yyyy-MM-dd`, which is what `<input type="date">` reads and writes. */
function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultRange(): { from: string; to: string } {
  const today = new Date();
  const start = new Date(
    today.getTime() - (DEFAULT_RANGE_DAYS - 1) * MS_PER_DAY,
  );
  return { from: toInputDate(start), to: toInputDate(today) };
}

/** Inclusive length of the period, or null when either bound is missing. */
function rangeDays(from: string, to: string): number | null {
  if (!from || !to) return null;
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.round((end - start) / MS_PER_DAY) + 1;
}

export interface ReportFiltersState {
  filters: ReportFilters;
  /** Why the current period cannot be requested, in Indonesian, or null. */
  rangeError: string | null;
  setFilters: (patch: Partial<ReportFilters>) => void;
  reset: () => void;
}

/**
 * Period and filter state for both report screens.
 *
 * The range is validated here as well as on the server. That is not
 * duplication for its own sake: the server has to reject a bad range because a
 * client can send anything, and the screen has to explain a bad range because
 * a red 422 toast does not tell someone their end date is before their start
 * date.
 */
export function useReportFilters(): ReportFiltersState {
  const [filters, setState] = useState<ReportFilters>(() => ({
    ...defaultRange(),
    status: "",
    shopId: "",
    paymentMethod: "",
  }));

  const setFilters = useCallback((patch: Partial<ReportFilters>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState({
      ...defaultRange(),
      status: "",
      shopId: "",
      paymentMethod: "",
    });
  }, []);

  const rangeError = useMemo(() => {
    if (!filters.from || !filters.to) {
      return "Tanggal mulai dan tanggal akhir wajib diisi.";
    }

    const days = rangeDays(filters.from, filters.to);
    if (days === null) return "Tanggal tidak valid.";
    if (days < 1)
      return "Tanggal akhir tidak boleh lebih awal dari tanggal mulai.";
    if (days > MAX_RANGE_DAYS) {
      return `Rentang maksimal ${MAX_RANGE_DAYS} hari. Persempit periodenya.`;
    }
    return null;
  }, [filters.from, filters.to]);

  return { filters, rangeError, setFilters, reset };
}
