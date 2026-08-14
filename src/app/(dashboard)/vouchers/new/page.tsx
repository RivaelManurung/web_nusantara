import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { VoucherForm } from "@/features/voucher/components/voucher-form";

export const metadata: Metadata = { title: "Tambah Voucher" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.vouchers}
      description="Voucher ditukar pelanggan dengan poin dan berlaku pada rentang tanggal yang dipilih."
    >
      <VoucherForm />
    </FormPage>
  );
}
