/**
 * Display formatting, centralised.
 *
 * The Vue app had a useCurrencyFormatter composable for money but formatted
 * dates inline with moment in each component, so the same timestamp appeared in
 * three different shapes across the dashboard.
 */

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("id-ID", { notation: "compact" });

const longDate = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

const dateWithTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(
  value: number | string | null | undefined,
): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (amount == null || Number.isNaN(amount)) return "-";
  return rupiah.format(amount);
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return compactNumber.format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? longDate.format(date) : "-";
}

export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  const date = toDate(value);
  return date ? dateWithTime.format(date) : "-";
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
