"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { eventApi } from "./api";
import type { EventInput } from "./types";

const KEY = "events";

export const eventKeys = {
  all: [KEY] as const,
  list: (params: ListParams) => [KEY, "list", params] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
};

export function useEvents(params: ListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventApi.list(params),
    // Keeps the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

/**
 * The full event, including its product rows.
 *
 * The list response already carries them, but a stale page could be showing a
 * bundle edited elsewhere, so the form refetches before seeding itself.
 */
export function useEvent(id: string | null) {
  return useQuery({
    queryKey: eventKeys.detail(id ?? ""),
    queryFn: () => eventApi.byId(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: eventKeys.all });
}

export function useCreateEvent() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: EventInput) => eventApi.create(input),
    onSuccess: async () => {
      toast.success("Event berhasil ditambahkan.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal menambahkan event.")),
  });
}

export function useUpdateEvent() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventInput }) =>
      eventApi.update(id, input),
    onSuccess: async () => {
      toast.success("Event berhasil diperbarui.");
      await invalidate();
    },
    onError: (error) =>
      toast.error(messageFor(error, "Gagal memperbarui event.")),
  });
}

export function useSetEventStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      eventApi.setStatus(id, isActive),
    onSuccess: async () => {
      toast.success("Status event diperbarui.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal mengubah status.")),
  });
}

export function useDeleteEvent() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => eventApi.remove(id),
    onSuccess: async () => {
      toast.success("Event berhasil dihapus.");
      await invalidate();
    },
    onError: (error) => toast.error(messageFor(error, "Gagal menghapus event.")),
  });
}

/** Prefers the server's own wording, which explains the specific rule that failed. */
function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
