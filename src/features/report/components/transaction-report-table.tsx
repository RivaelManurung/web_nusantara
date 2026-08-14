"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/format";

import { paymentLabel, statusLabel, type Transaction } from "../types";

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useTransactionColumns(): ColumnDef<Transaction>[] {
  return useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="font-medium">{row.original.code || "-"}</p>
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
          <div className="space-y-0.5">
            <p>{row.original.customerName || "-"}</p>
            <p className="text-muted-foreground text-xs">
              {row.original.shopName || "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "itemCount",
        header: () => <span className="block text-right">Item</span>,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {row.original.itemCount}
          </span>
        ),
      },
      {
        accessorKey: "subTotal",
        header: () => <span className="block text-right">Subtotal</span>,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {formatCurrency(row.original.subTotal)}
          </span>
        ),
      },
      {
        id: "discount",
        header: () => <span className="block text-right">Diskon</span>,
        cell: ({ row }) => {
          // Event and voucher discounts are separate columns in the database but
          // one number to a reader; the breakdown stays available on hover.
          const total =
            row.original.discountEvent + row.original.discountVoucher;

          return (
            <span
              className="block text-right tabular-nums"
              title={`Event ${formatCurrency(row.original.discountEvent)} · Voucher ${formatCurrency(row.original.discountVoucher)}`}
            >
              {total > 0 ? `-${formatCurrency(total)}` : formatCurrency(0)}
            </span>
          );
        },
      },
      {
        accessorKey: "shippingFee",
        header: () => <span className="block text-right">Ongkir</span>,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {formatCurrency(row.original.shippingFee)}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: () => <span className="block text-right">Total</span>,
        cell: ({ row }) => (
          <span className="block text-right font-medium tabular-nums">
            {formatCurrency(row.original.total)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isRevenue ? "default" : "secondary"}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Pembayaran",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {paymentLabel(row.original.paymentMethod)}
          </span>
        ),
      },
    ],
    [],
  );
}
