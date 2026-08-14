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

import type { Banner } from "../types";

interface Options {
  onEdit: (row: Banner) => void;
  onDelete: (row: Banner) => void;
  onToggleStatus: (row: Banner) => void;
  isTogglingId?: string | null;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useBannerColumns({
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingId,
}: Options): ColumnDef<Banner>[] {
  return useMemo(
    () => [
      {
        accessorKey: "photo",
        header: "Gambar",
        cell: ({ row }) => (
          <div className="bg-muted relative h-12 w-24 overflow-hidden rounded-md border">
            {row.original.photo ? (
              <Image
                src={row.original.photo}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Nama Banner",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <span
            className="text-muted-foreground block max-w-xs truncate"
            title={row.original.description}
          >
            {row.original.description}
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
