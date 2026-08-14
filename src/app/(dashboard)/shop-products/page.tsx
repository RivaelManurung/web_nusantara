import type { Metadata } from "next";

import { ShopProductsPage } from "@/features/shop-products/components/shop-products-page";

export const metadata: Metadata = { title: "Produk Toko" };

export default function Page() {
  return <ShopProductsPage />;
}
