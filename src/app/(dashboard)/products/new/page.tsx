import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { ProductForm } from "@/features/product/components/product-form";

export const metadata: Metadata = { title: "Tambah Produk" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.products}
      description="Data katalog yang dipakai semua toko. Harga di sini adalah harga dasar produk."
    >
      <ProductForm />
    </FormPage>
  );
}
