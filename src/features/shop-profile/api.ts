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
 * The cashier-scoped view of a shop.
 *
 * All three routes are unpaginated and resolve against the signed-in account,
 * so none of them takes a page or a search term.
 */
export const shopProfileApi = {
  /** Shops this cashier is assigned to. */
  async assignedShops(): Promise<AssignedShop[]> {
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
