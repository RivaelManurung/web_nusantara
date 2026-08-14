"use client";

import { create } from "zustand";

/**
 * Which shop the admin is managing.
 *
 * This is one of the two pieces of genuinely global client state in the app
 * (the other is the session): every per-shop screen reads it, and the choice
 * has to survive a route change and a reload. The shop's *data* is not kept
 * here -- that is server state and belongs to TanStack Query.
 *
 * The selection is read from localStorage in `hydrate()` rather than in the
 * initial state, because this module is evaluated on the server too and a
 * first render that disagreed with the client would be a hydration mismatch.
 */

const STORAGE_KEY = "nusantara.selected_shop_id";

const isBrowser = () => typeof window !== "undefined";

interface ShopContextState {
  selectedShopId: string | null;
  /** False until the stored choice has been read, so nothing auto-selects too early. */
  isHydrated: boolean;

  hydrate: () => void;
  selectShop: (shopId: string) => void;
  clear: () => void;
}

export const useShopContextStore = create<ShopContextState>((set) => ({
  selectedShopId: null,
  isHydrated: false,

  hydrate() {
    if (!isBrowser()) return;
    set({
      selectedShopId: window.localStorage.getItem(STORAGE_KEY),
      isHydrated: true,
    });
  },

  selectShop(shopId) {
    if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, shopId);
    set({ selectedShopId: shopId, isHydrated: true });
  },

  clear() {
    if (isBrowser()) window.localStorage.removeItem(STORAGE_KEY);
    set({ selectedShopId: null });
  },
}));
