"use client";

import { RotateCcw } from "lucide-react";

import { SearchInput } from "@/components/shared/search-input";
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

import {
  ORDER_STATUSES,
  orderTypeLabel,
  paymentLabel,
  statusLabel,
  type OrderFilters as Filters,
} from "../types";

/** The Select cannot hold an empty string, so "no filter" needs a sentinel. */
const ALL = "all";

const STATUS_OPTIONS = [
  { value: ALL, label: "Semua status" },
  ...ORDER_STATUSES.map((status) => ({
    value: status as string,
    label: statusLabel(status),
  })),
];

const TYPE_OPTIONS = [
  { value: ALL, label: "Semua tipe" },
  { value: "TAKE_AWAY", label: orderTypeLabel("TAKE_AWAY") },
  { value: "DELIVERY", label: orderTypeLabel("DELIVERY") },
];

const PAYMENT_OPTIONS = [
  { value: ALL, label: "Semua pembayaran" },
  { value: "CASH", label: paymentLabel("CASH") },
  { value: "QRIS", label: paymentLabel("QRIS") },
  { value: "TRANSFER", label: paymentLabel("TRANSFER") },
];

interface OrderFiltersProps {
  filters: Filters;
  rangeError: string | null;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

/**
 * The filter bar above the order worklist.
 *
 * Unlike the report filters, the period here is optional on both ends: this
 * screen answers "what needs attention right now", and forcing a date range
 * would hide the oldest stuck orders -- the ones that most need finding.
 */
export function OrderFilters({
  filters,
  rangeError,
  onChange,
  onReset,
}: OrderFiltersProps) {
  const hasAny =
    filters.status !== "" ||
    filters.orderType !== "" ||
    filters.paymentMethod !== "" ||
    filters.search !== "" ||
    filters.from !== "" ||
    filters.to !== "";

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="order-search">Cari</Label>
            <SearchInput
              value={filters.search}
              onChange={(value) => onChange({ search: value })}
              placeholder="Kode pesanan atau nama pelanggan…"
            />
          </div>

          <FilterSelect
            id="order-status"
            label="Status"
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(value) => onChange({ status: value })}
          />

          <FilterSelect
            id="order-type"
            label="Tipe pesanan"
            value={filters.orderType}
            options={TYPE_OPTIONS}
            onChange={(value) => onChange({ orderType: value })}
          />

          <FilterSelect
            id="order-payment"
            label="Pembayaran"
            value={filters.paymentMethod}
            options={PAYMENT_OPTIONS}
            onChange={(value) => onChange({ paymentMethod: value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="order-from">Dari tanggal</Label>
            <Input
              id="order-from"
              type="date"
              value={filters.from}
              aria-invalid={Boolean(rangeError)}
              aria-describedby={rangeError ? "order-range-error" : undefined}
              onChange={(event) => onChange({ from: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-to">Sampai tanggal</Label>
            <Input
              id="order-to"
              type="date"
              value={filters.to}
              aria-invalid={Boolean(rangeError)}
              aria-describedby={rangeError ? "order-range-error" : undefined}
              onChange={(event) => onChange({ to: event.target.value })}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={!hasAny}
            >
              <RotateCcw className="size-4" aria-hidden />
              Atur ulang
            </Button>
          </div>
        </div>

        {rangeError ? (
          <p id="order-range-error" className="text-destructive text-sm">
            {rangeError}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value === "" ? ALL : value}
        onValueChange={(next) => onChange(next === ALL ? "" : String(next))}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
