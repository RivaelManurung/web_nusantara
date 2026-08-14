"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";

import { reviewApi } from "./api";
import type { ReviewListParams } from "./types";

const KEY = "reviews";

export const reviewKeys = {
  all: [KEY] as const,
  list: (params: ReviewListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewApi.list(params),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a skeleton on every page or filter change.
    placeholderData: (previous) => previous,
  });
}

/** One record, for a detail view. */
export function useReview(id: string | null) {
  return useQuery({
    queryKey: reviewKeys.detail(id ?? ""),
    queryFn: () => reviewApi.byId(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Invalidating the whole feature after any write is deliberate: hiding a review
 * changes which rows belong on a visibility-filtered page this cache cannot see.
 */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: reviewKeys.all });
}

export function useSetReviewVisibility() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      reviewApi.setStatus(id, isVisible),
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.isVisible
          ? "Ulasan ditampilkan kembali."
          : "Ulasan disembunyikan.",
      );
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal mengubah status ulasan.")),
  });
}

export function useDeleteReview() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => reviewApi.remove(id),
    onSuccess: async () => {
      toast.success("Ulasan berhasil dihapus.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menghapus ulasan.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
