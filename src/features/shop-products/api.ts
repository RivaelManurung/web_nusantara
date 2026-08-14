import { api } from "@/lib/api/client";

import {
  toShopOption,
  toShopProduct,
  toShopSummary,
  type ShopOption,
  type ShopOptionDto,
  type ShopProduct,
  type ShopProductDto,
  type ShopSummary,
  type ShopSummaryDto,
} from "./types";

const BASE = "/cashier";

/**
 * The cashier's view of a shop and what it sells.
 *
 * These endpoints are scoped by the bearer token: the shop id in the path is
 * only honoured when the signed-in cashier is assigned to that shop, so the UI
 * never has to filter the list itself. None of them is paginated.
 */
export const shopProductsApi = {
  /** Shops this cashier may switch between. */
  async shops(): Promise<ShopOption[]> {
    const data = await api.get<ShopOptionDto[]>(`${BASE}/shop-names`);
    return (data ?? []).map(toShopOption);
  },

  async shopById(shopId: string): Promise<ShopSummary> {
    return toShopSummary(
      await api.get<ShopSummaryDto>(`${BASE}/shop-cashier/${shopId}`),
    );
  },

  async products(shopId: string): Promise<ShopProduct[]> {
    const data = await api.get<ShopProductDto[]>(
      `${BASE}/cashier-shop-product/${shopId}`,
    );
    return (data ?? []).map(toShopProduct);
  },
};
