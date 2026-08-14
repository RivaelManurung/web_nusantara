"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { formatCurrency } from "@/lib/format";

import type { TopProduct } from "../types";

/** Column definitions for the best-seller table. */
export function useTopProductColumns(): ColumnDef<TopProduct>[] {
  return useMemo(
    () => [
      {
        accessorKey: "productName",
        header: "Produk",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="font-medium">
              {/* A product removed after it was sold keeps its sales but loses
                  its name, so the row says so instead of rendering blank. */}
              {row.original.productName || "Produk sudah dihapus"}
            </p>
            {row.original.productCode ? (
              <p className="text-muted-foreground text-xs">
                {row.original.productCode}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "quantity",
        header: () => <span className="block text-right">Terjual</span>,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {row.original.quantity.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        accessorKey: "orderCount",
        header: () => <span className="block text-right">Pesanan</span>,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {row.original.orderCount.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        accessorKey: "revenue",
        header: () => <span className="block text-right">Pendapatan</span>,
        cell: ({ row }) => (
          <span className="block text-right font-medium tabular-nums">
            {formatCurrency(row.original.revenue)}
          </span>
        ),
      },
    ],
    [],
  );
}
