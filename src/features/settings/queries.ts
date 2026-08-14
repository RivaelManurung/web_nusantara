"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi, type ChangePasswordPayload } from "@/features/auth/api";
import { ApiError } from "@/lib/api/errors";

/**
 * Settings is thin on purpose.
 *
 * There is no `settings/api.ts`: the only endpoint this screen calls is
 * `PATCH /auth/password`, which already belongs to `authApi` -- the Vue app's
 * `SettingsRemoteSource` wrapping `PUT /user/admin/change-password` was a
 * second copy of a session endpoint, not a feature of its own. The profile
 * shown on the first tab comes from the session store, which already holds it.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Kata sandi Anda berhasil diperbarui.");
    },
    onError: (error) => {
      // The server explains which rule failed -- "kata sandi saat ini salah"
      // reads very differently from a generic failure, and the Vue app went out
      // of its way with an IncorrectPasswordFailure subclass to keep it.
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal mengubah kata sandi.",
      );
    },
  });
}
