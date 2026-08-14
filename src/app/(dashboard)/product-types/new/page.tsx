import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { TypeProductForm } from "@/features/type-product/components/type-product-form";

export const metadata: Metadata = { title: "Tambah Tipe Produk" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.productTypes}
      description="Tipe produk mengelompokkan katalog, misalnya “Keripik & Kerupuk”."
    >
      <TypeProductForm />
    </FormPage>
  );
}
