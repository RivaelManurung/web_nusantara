"use client";

import { useQuery } from "@tanstack/react-query";

import { shopProfileApi } from "./api";

const KEY = "shop-profile";

export const shopProfileKeys = {
  all: [KEY] as const,
  assigned: [KEY, "assigned"] as const,
  details: (shopId: string) => [KEY, "details", shopId] as const,
  products: (shopId: string) => [KEY, "products", shopId] as const,
};

/**
 * The shops this cashier may work in.
 *
 * Held for the session because assignments are changed by an admin, not by the
 * cashier looking at this page.
 */
export function useAssignedShops() {
  return useQuery({
    queryKey: shopProfileKeys.assigned,
    queryFn: () => shopProfileApi.assignedShops(),
    staleTime: 10 * 60_000,
  });
}

export function useShopDetails(shopId: string | null) {
  return useQuery({
    queryKey: shopProfileKeys.details(shopId ?? ""),
    queryFn: () => shopProfileApi.details(shopId as string),
    enabled: Boolean(shopId),
  });
}

export function useShopProducts(shopId: string | null) {
  return useQuery({
    queryKey: shopProfileKeys.products(shopId ?? ""),
    queryFn: () => shopProfileApi.products(shopId as string),
    enabled: Boolean(shopId),
  });
}
