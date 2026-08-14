"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
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

import type { Shop } from "../types";

interface Options {
  onEdit: (row: Shop) => void;
  onDelete: (row: Shop) => void;
  onToggleStatus: (row: Shop) => void;
  isTogglingId?: string | null;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useShopColumns({
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingId,
}: Options): ColumnDef<Shop>[] {
  return useMemo(
    () => [
      {
        accessorKey: "cover",
        header: "Cover",
        cell: ({ row }) => (
          <div className="bg-muted relative h-12 w-16 overflow-hidden rounded-md border">
            {row.original.cover ? (
              <Image
                src={row.original.cover}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Toko",
        cell: ({ row }) => (
          <div className="min-w-0 max-w-xs">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {row.original.fullAddress || "Alamat belum diisi"}
            </p>
          </div>
        ),
      },
      {
        id: "cashiers",
        header: "Kasir",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.cashiers.length}
          </span>
        ),
      },
      {
        id: "products",
        header: "Produk",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.products.length}
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
              aria-label={`Ubah status ${row.original.name}`}
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
                    aria-label={`Aksi untuk ${row.original.name}`}
                  >
                    <MoreHorizontal className="size-4" aria-hidden />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
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
    [isTogglingId, onDelete, onEdit, onToggleStatus],
  );
}
