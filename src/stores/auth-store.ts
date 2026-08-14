"use client";

import { create } from "zustand";

import { authApi, type LoginPayload } from "@/features/auth/api";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { Profile } from "@/types/auth";

interface AuthState {
  profile: Profile | null;
  /** False until the stored session has been checked, so guards do not flash. */
  isReady: boolean;
  isAuthenticating: boolean;

  login: (payload: LoginPayload) => Promise<Profile>;
  adoptSession: () => Promise<Profile | null>;
  restore: () => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;
}

/**
 * Session state.
 *
 * Only what is genuinely global lives here. Server data (products, shops, ...)
 * belongs to TanStack Query, which the Vue app lacked -- each of its Pinia
 * stores hand-rolled its own `items` / `isLoading` / `error` triple plus a
 * refetch, and they drifted apart.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isReady: false,
  isAuthenticating: false,

  async login(payload) {
    set({ isAuthenticating: true });
    try {
      const pair = await authApi.login(payload);
      tokenStorage.save(pair);

      const profile = await authApi.profile();
      set({ profile });
      return profile;
    } finally {
      set({ isAuthenticating: false });
    }
  },

  /** Loads the profile for tokens already saved, used after a social or OTP sign-in. */
  async adoptSession() {
    const profile = await authApi.profile();
    set({ profile });
    return profile;
  },

  async restore() {
    if (!tokenStorage.refreshToken) {
      set({ isReady: true });
      return;
    }

    try {
      const profile = await authApi.profile();
      set({ profile, isReady: true });
    } catch {
      // An unusable stored session is indistinguishable from none.
      tokenStorage.clear();
      set({ profile: null, isReady: true });
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } catch {
      // Signing out must succeed locally even when the request does not:
      // otherwise a user on a flaky connection is stuck signed in.
    } finally {
      get().clear();
    }
  },

  clear() {
    tokenStorage.clear();
    set({ profile: null, isReady: true });
  },
}));
