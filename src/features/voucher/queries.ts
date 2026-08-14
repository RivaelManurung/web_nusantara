"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { voucherApi } from "./api";
import type { VoucherInput } from "./types";

const KEY = "vouchers";

export const voucherKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useVouchers(params: ListParams) {
  return useQuery({
    queryKey: voucherKeys.list(params),
    queryFn: () => voucherApi.list(params),
    // Keeps the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: voucherKeys.all });
}

export function useCreateVoucher() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: VoucherInput) => voucherApi.create(input),
    onSuccess: async () => {
      toast.success("Voucher berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan voucher.")),
  });
}

export function useUpdateVoucher() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VoucherInput }) =>
      voucherApi.update(id, input),
    onSuccess: async () => {
      toast.success("Voucher berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui voucher.")),
  });
}

export function useSetVoucherStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      voucherApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status voucher diperbarui.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal mengubah status.")),
  });
}

export function useDeleteVoucher() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => voucherApi.remove(id),
    onSuccess: async () => {
      toast.success("Voucher berhasil dihapus.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menghapus voucher.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
