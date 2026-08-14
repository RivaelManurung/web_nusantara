import type { Metadata } from "next";

import { ShopPage } from "@/features/shop/components/shop-page";

export const metadata: Metadata = { title: "Manajemen Toko" };

export default function Page() {
  return <ShopPage />;
}
