"use client";

import { RotateCcw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useShopOptions } from "../queries";
import {
  GRANULARITY_LABELS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type Granularity,
  type OrderStatus,
  type PaymentMethod,
  type ReportFilters as Filters,
} from "../types";

/** The Select cannot hold an empty string, so "no filter" needs a sentinel. */
const ALL = "all";

const STATUS_OPTIONS = [
  { value: ALL, label: "Semua status" },
  ...ORDER_STATUSES.map((status) => ({
    value: status as string,
    label: ORDER_STATUS_LABELS[status],
  })),
];

const PAYMENT_OPTIONS = [
  { value: ALL, label: "Semua pembayaran" },
  ...PAYMENT_METHODS.map((method) => ({
    value: method as string,
    label: PAYMENT_METHOD_LABELS[method],
  })),
];

const GRANULARITY_OPTIONS = (
  Object.keys(GRANULARITY_LABELS) as Granularity[]
).map((value) => ({
  value: value as string,
  label: GRANULARITY_LABELS[value],
}));

interface ReportFiltersProps {
  filters: Filters;
  rangeError: string | null;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  /** Only the transaction report filters by a single status. */
  showStatus?: boolean;
  /** Present on the financial report, which buckets its series. */
  granularity?: Granularity;
  onGranularityChange?: (value: Granularity) => void;
}

/**
 * The filter bar shared by both report screens.
 *
 * The dates are plain `<input type="date">`. The app has a themed DateField
 * built on the calendar popover, but that one is a form control with its own
 * label, error slot and typed text parsing; here the two dates are a single
 * range that has to stay cheap to adjust, and the native control gives keyboard
 * entry and a picker without a second dependency.
 */
export function ReportFilters({
  filters,
  rangeError,
  onChange,
  onReset,
  showStatus = false,
  granularity,
  onGranularityChange,
}: ReportFiltersProps) {
  const { data: shops, isLoading: isLoadingShops } = useShopOptions();

  const shopOptions = [
    { value: ALL, label: "Semua toko" },
    ...(shops ?? []).map((shop) => ({ value: shop.id, label: shop.name })),
  ];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="report-from">Dari tanggal</Label>
            <Input
              id="report-from"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => onChange({ from: event.target.value })}
              aria-invalid={Boolean(rangeError)}
              aria-describedby={rangeError ? "report-range-error" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-to">Sampai tanggal</Label>
            <Input
              id="report-to"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => onChange({ to: event.target.value })}
              aria-invalid={Boolean(rangeError)}
              aria-describedby={rangeError ? "report-range-error" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-shop">Toko</Label>
            <Select
              items={shopOptions}
              value={filters.shopId || ALL}
              onValueChange={(value) =>
                onChange({ shopId: value === ALL ? "" : (value as string) })
              }
              disabled={isLoadingShops}
            >
              <SelectTrigger id="report-shop" className="w-full">
                <SelectValue
                  placeholder={isLoadingShops ? "Memuat toko…" : "Semua toko"}
                />
              </SelectTrigger>
              <SelectContent>
                {shopOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-payment">Metode pembayaran</Label>
            <Select
              items={PAYMENT_OPTIONS}
              value={filters.paymentMethod || ALL}
              onValueChange={(value) =>
                onChange({
                  paymentMethod: value === ALL ? "" : (value as PaymentMethod),
                })
              }
            >
              <SelectTrigger id="report-payment" className="w-full">
                <SelectValue placeholder="Semua pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showStatus ? (
            <div className="space-y-2">
              <Label htmlFor="report-status">Status pesanan</Label>
              <Select
                items={STATUS_OPTIONS}
                value={filters.status || ALL}
                onValueChange={(value) =>
                  onChange({
                    status: value === ALL ? "" : (value as OrderStatus),
                  })
                }
              >
                <SelectTrigger id="report-status" className="w-full">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {granularity && onGranularityChange ? (
            <div className="space-y-2">
              <Label htmlFor="report-granularity">Kelompok waktu</Label>
              <Select
                items={GRANULARITY_OPTIONS}
                value={granularity}
                onValueChange={(value) =>
                  onGranularityChange(value as Granularity)
                }
              >
                <SelectTrigger id="report-granularity" className="w-full">
                  <SelectValue placeholder="Harian" />
                </SelectTrigger>
                <SelectContent>
                  {GRANULARITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            Atur ulang
          </Button>
        </div>

        {rangeError ? (
          <Alert variant="destructive" id="report-range-error">
            <AlertDescription>{rangeError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
