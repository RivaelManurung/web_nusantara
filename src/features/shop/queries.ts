"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { shopApi } from "./api";
import type { ShopInput } from "./types";

const KEY = "shops";

export const shopKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useShops(params: ListParams) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopApi.list(params),
    // Keeps the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

/**
 * A single shop, loaded when the edit dialog opens.
 *
 * The list response does not always carry the full `shop_product` /
 * `shop_cashier` relations, so the form seeds itself from the detail endpoint
 * rather than from the row the user clicked.
 */
export function useShop(id: string | null) {
  return useQuery({
    queryKey: shopKeys.detail(id ?? ""),
    queryFn: () => shopApi.byId(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: shopKeys.all });
}

export function useCreateShop() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: ShopInput) => shopApi.create(input),
    onSuccess: async () => {
      toast.success("Toko berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan toko.")),
  });
}

export function useUpdateShop() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ShopInput }) =>
      shopApi.update(id, input),
    onSuccess: async () => {
      toast.success("Toko berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui toko.")),
  });
}

export function useSetShopStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      shopApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status toko diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal mengubah status toko.")),
  });
}

export function useDeleteShop() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => shopApi.remove(id),
    onSuccess: async () => {
      toast.success("Toko berhasil dihapus.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal menghapus toko.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
