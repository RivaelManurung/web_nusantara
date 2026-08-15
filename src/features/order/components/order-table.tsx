"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDateTime } from "@/lib/format";

import {
  isStalled,
  orderTypeLabel,
  paymentLabel,
  type OrderSummary,
} from "../types";
import { OrderStatusBadge } from "./order-status-badge";

interface Options {
  detailHref: (row: OrderSummary) => string;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useOrderColumns({
  detailHref,
}: Options): ColumnDef<OrderSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => (
          <div className="min-w-36">
            {/* The real link lives in the primary cell: the row's click handler
                is a mouse convenience only, per the DataTable contract. */}
            <Link
              href={detailHref(row.original)}
              className="font-medium tabular-nums hover:underline"
            >
              {row.original.code || "-"}
            </Link>
            <p className="text-muted-foreground text-xs">
              {formatDateTime(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Pelanggan",
        cell: ({ row }) => (
          <div className="min-w-36">
            <p className="truncate">{row.original.customerName || "-"}</p>
            <p className="text-muted-foreground truncate text-xs">
              {row.original.shopName || "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={row.original.status} />
            {isStalled(row.original) ? (
              <StalledMarker row={row.original} />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "orderType",
        header: "Tipe",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{orderTypeLabel(row.original.orderType)}</p>
            <p className="text-muted-foreground text-xs">
              {paymentLabel(row.original.paymentMethod)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "itemCount",
        header: "Item",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.itemCount}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.total)}
          </span>
        ),
      },
    ],
    [detailHref],
  );
}

/**
 * Flags an order that has sat in one status too long.
 *
 * This is the column that turns a list into a worklist. The icon carries a
 * text alternative rather than colour alone, and the tooltip says how long --
 * "macet" without a duration tells an operator nothing about urgency.
 */
function StalledMarker({ row }: { row: OrderSummary }) {
  const label = `Tertahan ${humaniseMinutes(row.stalledForMinutes)} di status ini`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" aria-hidden />
            <span className="sr-only">{label}</span>
          </span>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** "3 jam 20 menit" reads better than "200 menit" once past an hour. */
export function humaniseMinutes(total: number): string {
  if (total < 1) return "kurang dari 1 menit";
  if (total < 60) return `${total} menit`;

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours < 24) {
    return minutes === 0 ? `${hours} jam` : `${hours} jam ${minutes} menit`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours === 0
    ? `${days} hari`
    : `${days} hari ${remainingHours} jam`;
}
