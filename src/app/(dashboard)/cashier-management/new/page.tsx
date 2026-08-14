import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { CashierForm } from "@/features/cashier/components/cashier-form";

export const metadata: Metadata = { title: "Tambah Kasir" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.cashierManagement}
      description="Kasir dapat masuk ke aplikasi dan melayani transaksi di toko yang ditugaskan kepadanya."
    >
      <CashierForm />
    </FormPage>
  );
}
