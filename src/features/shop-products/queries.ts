"use client";

import { useQuery } from "@tanstack/react-query";

import { shopProductsApi } from "./api";

const KEY = "shop-products";

export const shopProductKeys = {
  all: [KEY] as const,
  shops: [KEY, "shops"] as const,
  shop: (shopId: string) => [KEY, "shop", shopId] as const,
  products: (shopId: string) => [KEY, "products", shopId] as const,
};

export function useCashierShops() {
  return useQuery({
    queryKey: shopProductKeys.shops,
    queryFn: () => shopProductsApi.shops(),
    // The assignment changes only when an admin edits the shop, so this does
    // not need to be refetched on every focus.
    staleTime: 5 * 60 * 1000,
  });
}

export function useShopSummary(shopId: string | null) {
  return useQuery({
    queryKey: shopProductKeys.shop(shopId ?? ""),
    queryFn: () => shopProductsApi.shopById(shopId as string),
    enabled: Boolean(shopId),
  });
}

export function useShopProducts(shopId: string | null) {
  return useQuery({
    queryKey: shopProductKeys.products(shopId ?? ""),
    queryFn: () => shopProductsApi.products(shopId as string),
    enabled: Boolean(shopId),
  });
}
