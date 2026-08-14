"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";

import type { ShopProduct } from "../types";

/** Read-only columns: a cashier can see the shop's stock but not edit it here. */
export function useShopProductColumns(): ColumnDef<ShopProduct>[] {
  return useMemo(
    () => [
      {
        accessorKey: "coverImage",
        header: "Gambar",
        cell: ({ row }) => (
          <div className="bg-muted relative size-12 overflow-hidden rounded-md border">
            {row.original.coverImage ? (
              <Image
                src={row.original.coverImage}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Produk",
        cell: ({ row }) => (
          <div className="min-w-0 max-w-xs">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {row.original.code || row.original.typeProductName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stok",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.stock}
            {row.original.unit ? (
              <span className="text-muted-foreground ml-1">
                {row.original.unit}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
      },
    ],
    [],
  );
}
