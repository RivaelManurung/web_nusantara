"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { cashierApi } from "./api";
import type { CashierInput } from "./types";

const KEY = "cashiers";

export const cashierKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useCashiers(params: ListParams) {
  return useQuery({
    queryKey: cashierKeys.list(params),
    queryFn: () => cashierApi.list(params),
    // Keeps the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

/**
 * The first page of cashiers, used to populate the shop form's picker.
 *
 * Held longer than a list view because it is read on every shop dialog open and
 * the roster changes rarely.
 */
export function useCashierOptions(enabled = true) {
  return useQuery({
    queryKey: [KEY, "options"] as const,
    queryFn: () => cashierApi.list({ page: 1 }),
    enabled,
    staleTime: 5 * 60_000,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: cashierKeys.all });
}

export function useCreateCashier() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: CashierInput) => cashierApi.create(input),
    onSuccess: async () => {
      toast.success("Kasir berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan kasir.")),
  });
}

export function useUpdateCashier() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CashierInput }) =>
      cashierApi.update(id, input),
    onSuccess: async () => {
      toast.success("Kasir berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui kasir.")),
  });
}

export function useSetCashierStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      cashierApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status kasir diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal mengubah status kasir.")),
  });
}

export function useDeleteCashier() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => cashierApi.remove(id),
    onSuccess: async () => {
      toast.success("Kasir berhasil dihapus.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal menghapus kasir.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
