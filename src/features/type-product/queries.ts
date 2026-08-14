"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { typeProductApi } from "./api";
import type { TypeProductInput } from "./types";

const KEY = "type-products";

export const typeProductKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useTypeProducts(params: ListParams) {
  return useQuery({
    queryKey: typeProductKeys.list(params),
    queryFn: () => typeProductApi.list(params),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a skeleton on every page change.
    placeholderData: (previous) => previous,
  });
}

/**
 * Invalidating the whole feature after any write is deliberate: these lists are
 * small and a category rename changes rows on pages this cache cannot see.
 */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: typeProductKeys.all });
}

export function useCreateTypeProduct() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: TypeProductInput) => typeProductApi.create(input),
    onSuccess: async () => {
      toast.success("Tipe produk berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan tipe produk.")),
  });
}

export function useUpdateTypeProduct() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TypeProductInput }) =>
      typeProductApi.update(id, input),
    onSuccess: async () => {
      toast.success("Tipe produk berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui tipe produk.")),
  });
}

export function useSetTypeProductStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      typeProductApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status tipe produk diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal mengubah status.")),
  });
}

export function useDeleteTypeProduct() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => typeProductApi.remove(id),
    onSuccess: async () => {
      toast.success("Tipe produk berhasil dihapus.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menghapus tipe produk.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
