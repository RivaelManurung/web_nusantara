"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";

import { pointApi } from "./api";
import type { AdjustmentInput } from "./types";

const KEY = "points";

export const pointKeys = {
  all: [KEY] as const,
  balance: (userId: string) => [KEY, "balance", userId] as const,
  history: (userId: string, page: number, direction: string) =>
    [KEY, "history", userId, page, direction] as const,
  vouchers: (userId: string) => [KEY, "vouchers", userId] as const,
};

export function usePointBalance(userId: string | null) {
  return useQuery({
    queryKey: pointKeys.balance(userId ?? ""),
    queryFn: () => pointApi.balance(userId as string),
    enabled: Boolean(userId),
  });
}

export function usePointHistory(
  userId: string | null,
  page: number,
  direction: string,
) {
  return useQuery({
    queryKey: pointKeys.history(userId ?? "", page, direction),
    queryFn: () => pointApi.history(userId as string, page, direction),
    enabled: Boolean(userId),
    placeholderData: (previous) => previous,
  });
}

export function useClaimedVouchers(userId: string | null) {
  return useQuery({
    queryKey: pointKeys.vouchers(userId ?? ""),
    queryFn: () => pointApi.claimedVouchers(userId as string),
    enabled: Boolean(userId),
  });
}

/**
 * Applies a manual correction.
 *
 * The history is invalidated as well as the balance: a correction is itself a
 * ledger movement, so the list gains a row. The account detail is invalidated
 * too because it carries a copy of the balance in its summary card.
 */
export function useAdjustPoints(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdjustmentInput) => pointApi.adjust(userId, input),
    onSuccess: async (balance) => {
      queryClient.setQueryData(pointKeys.balance(userId), balance);
      toast.success("Koreksi poin tercatat.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [KEY, "history", userId] }),
        queryClient.invalidateQueries({
          queryKey: ["customers", "detail", userId],
        }),
      ]);
    },
    onError: (error) => {
      // The API is specific: a deduction larger than the ledger balance and a
      // missing reason are different mistakes with different fixes.
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal menyimpan koreksi poin.",
      );
    },
  });
}
