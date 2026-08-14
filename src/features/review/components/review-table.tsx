"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
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
import { formatDateTime } from "@/lib/format";

import type { Review } from "../types";
import { RatingStars } from "./rating-stars";

interface Options {
  onDelete: (row: Review) => void;
  onToggleVisibility: (row: Review) => void;
  isTogglingId?: string | null;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useReviewColumns({
  onDelete,
  onToggleVisibility,
  isTogglingId,
}: Options): ColumnDef<Review>[] {
  return useMemo(
    () => [
      {
        accessorKey: "productName",
        header: "Produk",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.productName || "Produk dihapus"}
          </span>
        ),
      },
      {
        accessorKey: "reviewerName",
        header: "Pembeli",
        cell: ({ row }) => (
          <span>{row.original.reviewerName || "Akun dihapus"}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => <RatingStars value={row.original.rating} />,
      },
      {
        accessorKey: "comment",
        header: "Ulasan",
        cell: ({ row }) => (
          // Long comments are clamped so one essay cannot push the action
          // column off screen; the full text stays in the title attribute.
          <p
            className="text-muted-foreground line-clamp-2 max-w-md text-sm"
            title={row.original.comment}
          >
            {row.original.comment || "—"}
          </p>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "isVisible",
        header: "Tampil",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Switch
              checked={row.original.isVisible}
              onCheckedChange={() => onToggleVisibility(row.original)}
              disabled={isTogglingId === row.original.id}
              aria-label={`Ubah tampilan ulasan dari ${row.original.reviewerName}`}
            />
            <StatusBadge
              active={row.original.isVisible}
              activeLabel="Tampil"
              inactiveLabel="Disembunyikan"
            />
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
                    aria-label={`Aksi untuk ulasan dari ${row.original.reviewerName}`}
                  >
                    <MoreHorizontal className="size-4" aria-hidden />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
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
    [isTogglingId, onDelete, onToggleVisibility],
  );
}
