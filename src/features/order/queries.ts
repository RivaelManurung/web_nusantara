"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";

import { orderApi } from "./api";
import type { OrderFilters } from "./types";

const KEY = "orders";

export const orderKeys = {
  all: [KEY] as const,
  list: (filters: OrderFilters, page: number) =>
    [KEY, "list", filters, page] as const,
  detail: (id: string) => [KEY, "detail", id] as const,
  timeline: (id: string) => [KEY, "timeline", id] as const,
};

/**
 * The order worklist.
 *
 * staleTime is deliberately short. Unlike the catalogue, this list is what an
 * operator watches while orders arrive, so serving a minute-old page would hide
 * exactly the rows they are waiting for.
 */
export function useOrders(filters: OrderFilters, page: number) {
  return useQuery({
    queryKey: orderKeys.list(filters, page),
    queryFn: () => orderApi.list(filters, page),
    staleTime: 15_000,
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a skeleton on every page change.
    placeholderData: (previous) => previous,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => orderApi.byId(id as string),
    enabled: Boolean(id),
  });
}

export function useOrderTimeline(id: string | null) {
  return useQuery({
    queryKey: orderKeys.timeline(id ?? ""),
    queryFn: () => orderApi.timeline(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Moves an order to a new status.
 *
 * The mutation writes the fresh detail straight into the cache rather than
 * relying on the refetch alone: the response already carries the updated order
 * and its new legal next steps, so the buttons change the instant the request
 * returns instead of flickering through the old set.
 */
export function useChangeOrderStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, reason }: { status: string; reason: string }) =>
      orderApi.setStatus(id, status, reason),
    onSuccess: async (updated) => {
      queryClient.setQueryData(orderKeys.detail(id), updated);
      toast.success("Status pesanan berhasil diperbarui.");
      // The timeline gained a row, and every list page now shows a stale status
      // for this order.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.timeline(id) }),
        queryClient.invalidateQueries({ queryKey: [KEY, "list"] }),
      ]);
    },
    onError: (error) => {
      // The API explains precisely why a transition was refused -- "pesanan
      // sudah dibatalkan" reads very differently from a generic failure, and a
      // CONFLICT here usually means a colleague acted first.
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal memperbarui status pesanan.",
      );
    },
  });
}
