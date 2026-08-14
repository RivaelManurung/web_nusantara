"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Images, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";

import type { Product } from "../types";

interface Options {
  /** Edit is a real page now, so the row links rather than opening a dialog. */
  editHref: (row: Product) => string;
  onDelete: (row: Product) => void;
  onToggleStatus: (row: Product) => void;
  onViewGallery: (row: Product) => void;
  isTogglingId?: string | null;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useProductColumns({
  editHref,
  onDelete,
  onToggleStatus,
  onViewGallery,
  isTogglingId,
}: Options): ColumnDef<Product>[] {
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
        header: "Nama",
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-muted-foreground text-xs">
              {row.original.typeProductName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.code}
          </Badge>
        ),
      },
      {
        accessorKey: "price",
        header: () => <span className="block text-right">Harga</span>,
        cell: ({ row }) => (
          <span className="block text-right font-medium tabular-nums">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.unit || "-"}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-2 max-w-xs text-sm">
            {row.original.description || "-"}
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
                <DropdownMenuItem onClick={() => onViewGallery(row.original)}>
                  <Images className="size-4" aria-hidden />
                  Lihat galeri
                </DropdownMenuItem>
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
    [editHref, isTogglingId, onDelete, onToggleStatus, onViewGallery],
  );
}
