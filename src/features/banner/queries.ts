"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { bannerApi } from "./api";
import type { BannerInput } from "./types";

const KEY = "banners";

export const bannerKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

/** One record, for the edit screen. */
export function useBanner(id: string | null) {
  return useQuery({
    queryKey: bannerKeys.detail(id ?? ""),
    queryFn: () => bannerApi.byId(id as string),
    enabled: Boolean(id),
  });
}

export function useBanners(params: ListParams) {
  return useQuery({
    queryKey: bannerKeys.list(params),
    queryFn: () => bannerApi.list(params),
    // Keeps the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

/** Invalidates the whole feature: a rename changes rows this cache cannot see. */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: bannerKeys.all });
}

export function useCreateBanner() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: BannerInput) => bannerApi.create(input),
    onSuccess: async () => {
      toast.success("Banner berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan banner.")),
  });
}

export function useUpdateBanner() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BannerInput }) =>
      bannerApi.update(id, input),
    onSuccess: async () => {
      toast.success("Banner berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui banner.")),
  });
}

export function useSetBannerStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      bannerApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status banner diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal mengubah status.")),
  });
}

export function useDeleteBanner() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => bannerApi.remove(id),
    onSuccess: async () => {
      toast.success("Banner berhasil dihapus.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menghapus banner.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
