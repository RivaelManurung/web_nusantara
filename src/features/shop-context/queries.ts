"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth-store";

import { shopContextApi } from "./api";
import { useShopContextStore } from "./store";

const KEY = "shop-context";

export const shopContextKeys = {
  all: [KEY] as const,
  shops: [KEY, "shops"] as const,
  details: (shopId: string) => [KEY, "details", shopId] as const,
  products: (shopId: string) => [KEY, "products", shopId] as const,
};

/** The shops this admin may switch between. */
export function useAvailableShops() {
  const role = useAuthStore((state) => state.profile?.role);

  return useQuery({
    queryKey: shopContextKeys.shops,
    queryFn: () => shopContextApi.availableShops(),
    // Only an admin is assigned to shops; asking as any other role is a
    // guaranteed 403.
    enabled: role === "admin",
    // The assignment changes when a super admin edits it, which is rare.
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * The whole switcher state in one hook.
 *
 * The Vue store resolved the active shop imperatively in `initializeShopContext`
 * and had to guard against running twice. Here the active shop is derived from
 * the list plus the stored choice on every render, and the only side effect is
 * writing a fallback selection back to storage.
 */
export function useShopContext() {
  const { data: shops, isLoading, error } = useAvailableShops();

  const selectedShopId = useShopContextStore((state) => state.selectedShopId);
  const isHydrated = useShopContextStore((state) => state.isHydrated);
  const hydrate = useShopContextStore((state) => state.hydrate);
  const selectShop = useShopContextStore((state) => state.selectShop);

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [hydrate, isHydrated]);

  // A stored id that is no longer assigned must not win over a real one.
  const isStoredShopValid = Boolean(
    selectedShopId && shops?.some((shop) => shop.id === selectedShopId),
  );
  const activeShopId = isStoredShopValid
    ? selectedShopId
    : (shops?.[0]?.id ?? null);

  useEffect(() => {
    if (activeShopId && activeShopId !== selectedShopId) {
      selectShop(activeShopId);
    }
  }, [activeShopId, selectShop, selectedShopId]);

  return {
    shops: shops ?? [],
    activeShopId,
    activeShop: shops?.find((shop) => shop.id === activeShopId) ?? null,
    /** Undefined until the list has loaded; do not redirect on `false` before then. */
    hasAssignedShops: shops ? shops.length > 0 : undefined,
    isLoading,
    error,
    selectShop,
  };
}

/** Full record of the active shop. */
export function useActiveShopDetails(shopId: string | null) {
  return useQuery({
    queryKey: shopContextKeys.details(shopId ?? ""),
    queryFn: () => shopContextApi.details(shopId as string),
    enabled: Boolean(shopId),
  });
}

/** Products stocked by the active shop. */
export function useShopProducts(shopId: string | null) {
  return useQuery({
    queryKey: shopContextKeys.products(shopId ?? ""),
    queryFn: () => shopContextApi.products(shopId as string),
    enabled: Boolean(shopId),
  });
}
