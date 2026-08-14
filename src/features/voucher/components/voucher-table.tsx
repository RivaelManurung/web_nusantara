"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatDate } from "@/lib/format";

import type { Voucher } from "../types";

interface Options {
  /** Edit is a real page now, so the row links rather than opening a dialog. */
  editHref: (row: Voucher) => string;
  onDelete: (row: Voucher) => void;
  onToggleStatus: (row: Voucher) => void;
  isTogglingId?: string | null;
}

/** "20%" or "Rp25.000", depending on how the voucher was configured. */
export function describeDiscount(voucher: Voucher): string {
  return voucher.discountType === "percent"
    ? `${voucher.discountPercent}%`
    : formatCurrency(voucher.discountAmount);
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useVoucherColumns({
  editHref,
  onDelete,
  onToggleStatus,
  isTogglingId,
}: Options): ColumnDef<Voucher>[] {
  return useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => (
          <span className="font-medium tracking-wide">{row.original.code}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <span
            className="text-muted-foreground block max-w-[16rem] truncate"
            title={row.original.description}
          >
            {row.original.description || "-"}
          </span>
        ),
      },
      {
        id: "terms",
        header: "Ketentuan",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-medium">{describeDiscount(row.original)}</div>
            <div className="text-muted-foreground text-xs">
              Min. belanja {formatCurrency(row.original.minimumSpend)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "pointCost",
        header: "Biaya poin",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.pointCost.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        accessorKey: "quota",
        header: "Kuota",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.claimedCount} / {row.original.quota}
          </span>
        ),
      },
      {
        accessorKey: "endDate",
        header: "Berakhir",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDate(row.original.endDate)}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Switch
              checked={row.original.isActive}
              onCheckedChange={() => onToggleStatus(row.original)}
              disabled={isTogglingId === row.original.id}
              aria-label={`Ubah status voucher ${row.original.code}`}
            />
            <StatusBadge active={row.original.isActive} />
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Aksi</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Aksi untuk voucher ${row.original.code}`}
                  >
                    <MoreHorizontal className="size-4" aria-hidden />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  render={<Link href={editHref(row.original)} />}
                >
                  <Pencil className="size-4" aria-hidden />
                  Ubah
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [editHref, isTogglingId, onDelete, onToggleStatus],
  );
}
