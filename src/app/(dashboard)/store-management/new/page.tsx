import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { ShopForm } from "@/features/shop/components/shop-form";

export const metadata: Metadata = { title: "Tambah Toko" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.storeManagement}
      description="Lengkapi informasi toko, lokasinya, kasir yang bertugas, dan produk yang dijual."
    >
      <ShopForm />
    </FormPage>
  );
}
