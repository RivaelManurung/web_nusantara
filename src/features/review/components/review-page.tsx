"use client";

import { useCallback, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListParams } from "@/hooks/use-list-params";
import { ApiError } from "@/lib/api/errors";

import {
  useDeleteReview,
  useReviews,
  useSetReviewVisibility,
} from "../queries";
import {
  MAX_RATING,
  MIN_RATING,
  type Review,
  type VisibilityFilter,
} from "../types";
import { useReviewColumns } from "./review-table";

/** "all" plus one option per star, as the Select models them. */
const ALL = "all";

const RATING_OPTIONS = [
  { value: ALL, label: "Semua rating" },
  ...Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_option, index) => {
    const rating = MIN_RATING + index;
    return { value: String(rating), label: `${rating} bintang` };
  }),
];

const VISIBILITY_OPTIONS: { value: VisibilityFilter; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "visible", label: "Tampil" },
  { value: "hidden", label: "Disembunyikan" },
];

/**
 * Moderation screen for customer reviews.
 *
 * There is no "add" action: reviews are written by shoppers in the customer
 * app. All this page can do is find one, hide it, or remove it.
 */
export function ReviewPage() {
  const { params, setPage, setSearch } = useListParams();

  const [rating, setRating] = useState<string>(ALL);
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");

  const query = useMemo(
    () => ({
      ...params,
      // Left out entirely when unfiltered, so the request carries no `rating=`
      // for the backend to interpret.
      ...(rating === ALL ? {} : { rating: Number(rating) }),
      visibility,
    }),
    [params, rating, visibility],
  );

  const { data, isLoading, isFetching, error } = useReviews(query);

  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);

  const visibilityMutation = useSetReviewVisibility();
  const deleteMutation = useDeleteReview();

  const handleToggleVisibility = useCallback(
    (row: Review) =>
      visibilityMutation.mutate({ id: row.id, isVisible: !row.isVisible }),
    [visibilityMutation],
  );

  // Changing a filter from page four would otherwise land on a page the smaller
  // result set does not have, which looks like "no reviews".
  const changeRating = useCallback(
    (value: string) => {
      setRating(value);
      setPage(1);
    },
    [setPage],
  );

  const changeVisibility = useCallback(
    (value: VisibilityFilter) => {
      setVisibility(value);
      setPage(1);
    },
    [setPage],
  );

  const columns = useReviewColumns({
    onDelete: setPendingDelete,
    onToggleVisibility: handleToggleVisibility,
    isTogglingId: visibilityMutation.isPending
      ? visibilityMutation.variables?.id
      : null,
  });

  const isFiltered =
    rating !== ALL || visibility !== "all" || Boolean(params.search);

  return (
    <div className="space-y-6">
      <PageHeader description="Ulasan dan penilaian dari pembeli. Sembunyikan atau hapus ulasan yang melanggar aturan." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={params.search}
          onChange={setSearch}
          placeholder="Cari produk atau isi ulasan…"
        />

        <Select
          items={RATING_OPTIONS}
          value={rating}
          onValueChange={(value) => changeRating(value as string)}
        >
          <SelectTrigger
            aria-label="Saring berdasarkan rating"
            className="sm:w-44"
          >
            <SelectValue placeholder="Semua rating" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={VISIBILITY_OPTIONS}
          value={visibility}
          onValueChange={(value) => changeVisibility(value as VisibilityFilter)}
        >
          <SelectTrigger
            aria-label="Saring berdasarkan status"
            className="sm:w-44"
          >
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError ? error.message : "Gagal memuat data."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage={
              isFiltered
                ? "Tidak ada ulasan yang cocok dengan filter ini."
                : "Belum ada ulasan dari pembeli."
            }
          />

          {data ? (
            <Pagination
              pagination={data.pagination}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          ) : null}
        </>
      )}

      <ConfirmDialog
        title="Hapus ulasan?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={`Ulasan dari ${pendingDelete?.reviewerName ?? "pembeli"} akan dihapus permanen. Untuk sekadar menyembunyikannya dari pembeli lain, matikan saklar "Tampil".`}
        confirmLabel="Hapus"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
