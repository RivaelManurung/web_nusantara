"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { typeProductApi } from "@/features/type-product/api";

import { productApi } from "./api";
import type { ProductInput } from "./types";

const KEY = "products";

/** Hard stop, so a paging bug cannot turn the dropdown into an endless loop. */
const MAX_TYPE_PRODUCT_PAGES = 20;

export const productKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useProducts(params: ListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.list(params),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a skeleton on every page change.
    placeholderData: (previous) => previous,
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => productApi.byId(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Every product category, for the form's dropdown.
 *
 * The list endpoint is paginated and has no "all" mode, so the pages are walked
 * here rather than showing the user only the first ten categories. It reuses
 * `typeProductApi.list` instead of restating the endpoint.
 */
export function useTypeProductOptions() {
  return useQuery({
    queryKey: [KEY, "type-product-options"] as const,
    queryFn: async () => {
      const first = await typeProductApi.list({ page: 1 });
      const items = [...first.items];
      const pages = Math.min(
        first.pagination.total_pages,
        MAX_TYPE_PRODUCT_PAGES,
      );

      for (let page = 2; page <= pages; page += 1) {
        const next = await typeProductApi.list({ page });
        items.push(...next.items);
      }
      return items;
    },
    // Categories change rarely; refetching on every dialog open is wasteful.
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Invalidating the whole feature after any write is deliberate: a rename or a
 * status change reorders rows on pages this cache cannot see.
 */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
}

export function useCreateProduct() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: ProductInput) => productApi.create(input),
    onSuccess: async () => {
      toast.success("Produk berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan produk.")),
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      productApi.update(id, input),
    onSuccess: async () => {
      toast.success("Produk berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui produk.")),
  });
}

export function useSetProductStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status produk diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal mengubah status.")),
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: async () => {
      toast.success("Produk berhasil dihapus.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menghapus produk.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
