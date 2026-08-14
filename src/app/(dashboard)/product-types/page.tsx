import type { Metadata } from "next";

import { TypeProductPage } from "@/features/type-product/components/type-product-page";

export const metadata: Metadata = { title: "Tipe Produk" };

export default function Page() {
  return <TypeProductPage />;
}
