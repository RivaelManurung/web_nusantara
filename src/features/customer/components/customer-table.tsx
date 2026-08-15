"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

import { roleLabel, type CustomerSummary } from "../types";

interface Options {
  detailHref: (row: CustomerSummary) => string;
}

export function useCustomerColumns({
  detailHref,
}: Options): ColumnDef<CustomerSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <div className="min-w-44">
            {/* The real link lives in the primary cell: the row's click handler
                is a mouse convenience only, per the DataTable contract. */}
            <Link
              href={detailHref(row.original)}
              className="font-medium hover:underline"
            >
              {row.original.name || "-"}
            </Link>
            <p className="text-muted-foreground truncate text-xs">
              {row.original.email || row.original.phone || "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary">{roleLabel(row.original.role)}</Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            active={row.original.isActive}
            activeLabel="Aktif"
            inactiveLabel="Diblokir"
          />
        ),
      },
      {
        accessorKey: "orderCount",
        header: "Pesanan",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.orderCount}</span>
        ),
      },
      {
        accessorKey: "totalSpend",
        header: "Total belanja",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatCurrency(row.original.totalSpend)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Bergabung",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [detailHref],
  );
}
