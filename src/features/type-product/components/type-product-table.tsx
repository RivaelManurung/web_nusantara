"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
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

import type { TypeProduct } from "../types";

interface Options {
  /** Edit is a real page now, so the row links rather than opening a dialog. */
  editHref: (row: TypeProduct) => string;
  onDelete: (row: TypeProduct) => void;
  onToggleStatus: (row: TypeProduct) => void;
  isTogglingId?: string | null;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useTypeProductColumns({
  editHref,
  onDelete,
  onToggleStatus,
  isTogglingId,
}: Options): ColumnDef<TypeProduct>[] {
  return useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Gambar",
        cell: ({ row }) => (
          <div className="bg-muted relative size-12 overflow-hidden rounded-md border">
            {row.original.image ? (
              <Image
                src={row.original.image}
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
          <span className="font-medium">{row.original.name}</span>
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
