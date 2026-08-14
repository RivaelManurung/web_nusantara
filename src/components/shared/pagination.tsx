"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Pagination as PaginationMeta } from "@/types/api";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  pagination,
  onPageChange,
  isLoading,
}: PaginationProps) {
  const {
    current_page: page,
    per_page: perPage,
    total_data: total,
    total_pages: pages,
  } = pagination;

  if (total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Navigasi halaman"
    >
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Menampilkan <span className="text-foreground font-medium">{from}</span>–
        <span className="text-foreground font-medium">{to}</span> dari{" "}
        <span className="text-foreground font-medium">{total}</span> data
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Sebelumnya
        </Button>

        <span className="text-muted-foreground px-2 text-sm tabular-nums">
          {page} / {Math.max(pages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages || isLoading}
        >
          Berikutnya
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
