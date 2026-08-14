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
import { formatDate } from "@/lib/format";

import type { Cashier } from "../types";

interface Options {
  onEdit: (row: Cashier) => void;
  onDelete: (row: Cashier) => void;
  onToggleStatus: (row: Cashier) => void;
  isTogglingId?: string | null;
}

/** Column definitions, memoised so the table does not rebuild on every render. */
export function useCashierColumns({
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingId,
}: Options): ColumnDef<Cashier>[] {
  return useMemo(
    () => [
      {
        accessorKey: "photo",
        header: "Foto",
        cell: ({ row }) => (
          <div className="bg-muted relative size-12 overflow-hidden rounded-full border">
            {row.original.photo ? (
              <Image
                src={row.original.photo}
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
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              @{row.original.username}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Bergabung",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
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
