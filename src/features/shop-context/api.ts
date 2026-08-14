import { api } from "@/lib/api/client";

import {
  toActiveShop,
  toAssignedShop,
  toShopProduct,
  type ActiveShop,
  type ActiveShopDto,
  type AssignedShop,
  type AssignedShopDto,
  type ShopProduct,
  type ShopProductDto,
} from "./types";

/**
 * The shop-context endpoints.
 *
 * They live under `/cashier` because the backend groups per-shop reads there,
 * even though the admin panel is the caller. The paths are copied verbatim from
 * the Vue app's ShopContextRemoteSource so no API change is needed.
 */
export const shopContextApi = {
  /** Shops assigned to the signed-in admin, for the switcher. */
  async availableShops(): Promise<AssignedShop[]> {
    const rows = await api.get<AssignedShopDto[]>("/cashier/shop-names");
    return rows.map(toAssignedShop);
  },

  async details(shopId: string): Promise<ActiveShop> {
    return toActiveShop(
      await api.get<ActiveShopDto>(`/cashier/shop-cashier/${shopId}`),
    );
  },

  async products(shopId: string): Promise<ShopProduct[]> {
    const rows = await api.get<ShopProductDto[]>(
      `/cashier/cashier-shop-product/${shopId}`,
    );
    return rows.map(toShopProduct);
  },
};
