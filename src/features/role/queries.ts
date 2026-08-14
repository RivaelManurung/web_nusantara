"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { roleApi } from "./api";
import type { RoleInput } from "./types";

const KEY = "roles";

export const roleKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  catalog: [KEY, "permissions"] as const,
  permissions: (id: string) => [KEY, "permissions", id] as const,
};

export function useRoles(params: ListParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => roleApi.list(params),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a skeleton on every page change.
    placeholderData: (previous) => previous,
  });
}

/**
 * The permission catalogue.
 *
 * It only changes on deploy, so it is cached for the session rather than
 * refetched every time the matrix opens.
 */
export function usePermissionCatalog(enabled = true) {
  return useQuery({
    queryKey: roleKeys.catalog,
    queryFn: () => roleApi.permissions(),
    staleTime: Infinity,
    enabled,
  });
}

/** One role's grants, loaded when the matrix opens for it. */
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: roleKeys.permissions(roleId ?? ""),
    queryFn: () => roleApi.permissionsFor(roleId as string),
    enabled: Boolean(roleId),
  });
}

/**
 * Invalidating the whole feature after any write is deliberate: the lists are
 * small and a rename changes rows on pages this cache cannot see.
 */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: roleKeys.all });
}

export function useCreateRole() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: RoleInput) => roleApi.create(input),
    onSuccess: async () => {
      toast.success("Role berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal menambahkan role.")),
  });
}

export function useUpdateRole() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoleInput }) =>
      roleApi.update(id, input),
    onSuccess: async () => {
      toast.success("Role berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal memperbarui role.")),
  });
}

/**
 * Deleting a role the backend still sees in use answers 409 with a sentence
 * explaining what to do first ("reassign them"). That wording is far more
 * useful than any fallback this file could invent, so it is shown as-is.
 */
export function useDeleteRole() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => roleApi.remove(id),
    onSuccess: async () => {
      toast.success("Role berhasil dihapus.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal menghapus role.")),
  });
}

export function useReplaceRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, codes }: { roleId: string; codes: string[] }) =>
      roleApi.replacePermissions(roleId, codes),
    onSuccess: async (result) => {
      toast.success("Hak akses berhasil disimpan.");
      // Seed the cache with the server's own answer, so reopening the matrix
      // shows what was stored rather than what was submitted.
      queryClient.setQueryData(roleKeys.permissions(result.roleId), result);
      await queryClient.invalidateQueries({
        queryKey: roleKeys.permissions(result.roleId),
      });
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menyimpan hak akses.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
