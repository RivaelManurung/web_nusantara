"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";

import { customerApi } from "./api";
import type { CustomerFilters } from "./types";

const KEY = "customers";

export const customerKeys = {
  all: [KEY] as const,
  list: (filters: CustomerFilters, page: number) =>
    [KEY, "list", filters, page] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
  roles: [KEY, "roles"] as const,
};

export function useCustomers(filters: CustomerFilters, page: number) {
  return useQuery({
    queryKey: customerKeys.list(filters, page),
    queryFn: () => customerApi.list(filters, page),
    placeholderData: (previous) => previous,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ""),
    queryFn: () => customerApi.byId(id as string),
    enabled: Boolean(id),
  });
}

/**
 * The roles the filter offers.
 *
 * Held for the session: roles are changed on the permission screen, not while
 * somebody is paging through accounts.
 */
export function useCustomerRoles() {
  return useQuery({
    queryKey: customerKeys.roles,
    queryFn: () => customerApi.roles(),
    staleTime: 10 * 60_000,
  });
}

/**
 * Blocks or unblocks an account.
 *
 * The fresh detail is written straight into the cache because the response
 * already carries it, including the audit row just written -- so the moderation
 * history gains its new entry the instant the request returns.
 */
export function useSetCustomerStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isActive, reason }: { isActive: boolean; reason: string }) =>
      customerApi.setStatus(id, isActive, reason),
    onSuccess: async (updated) => {
      queryClient.setQueryData(customerKeys.detail(id), updated);
      toast.success(
        updated.isActive
          ? "Akun berhasil diaktifkan kembali."
          : "Akun berhasil diblokir dan seluruh sesinya dihentikan.",
      );
      await queryClient.invalidateQueries({ queryKey: [KEY, "list"] });
    },
    onError: (error) => {
      // The API is specific about why: blocking yourself, an account that is
      // already blocked, and a failed session revocation all read very
      // differently, and the last one means the operator must retry.
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal mengubah status akun.",
      );
    },
  });
}
