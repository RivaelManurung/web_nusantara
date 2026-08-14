import type { Metadata } from "next";

import { ProductPage } from "@/features/product/components/product-page";

export const metadata: Metadata = { title: "Produk" };

export default function Page() {
  return <ProductPage />;
}
