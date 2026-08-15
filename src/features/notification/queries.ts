"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ListParams } from "@/types/api";

import { notificationApi } from "./api";
import type { BroadcastInput } from "./types";

const KEY = "notifications";

export const notificationKeys = {
  all: [KEY] as const,
  customers: (params: ListParams) => [KEY, "customers", params] as const,
  broadcasts: (page: number) => [KEY, "broadcasts", page] as const,
};

/**
 * The send history.
 *
 * staleTime is short because this is the screen an operator returns to right
 * after sending, and a cached page would not show the send they just made.
 */
export function useBroadcasts(page: number) {
  return useQuery({
    queryKey: notificationKeys.broadcasts(page),
    queryFn: () => notificationApi.broadcasts(page),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}

/** Candidate recipients for the picker. */
export function useCustomerCandidates(params: ListParams, enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.customers(params),
    queryFn: () => notificationApi.customers(params),
    // The directory is only fetched once the operator chooses to pick people
    // by hand; the other two audiences never need it.
    enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * Sending writes rows into customers' inboxes, which this panel never reads --
 * but it also files a record in the send history, which this panel very much
 * does. That list is invalidated so the new send appears the moment the
 * operator returns to it.
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BroadcastInput) => notificationApi.send(input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY, "broadcasts"],
      });
      if (!result.isPushEnabled) {
        toast.warning(
          "Notifikasi tersimpan di inbox aplikasi, tetapi push belum aktif di server.",
        );
        return;
      }
      toast.success(`Notifikasi terkirim ke ${result.recipients} pelanggan.`);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "Gagal mengirim notifikasi.",
      ),
  });
}
