import type { Metadata } from "next";

import { VoucherPage } from "@/features/voucher/components/voucher-page";

export const metadata: Metadata = { title: "Voucher" };

export default function Page() {
  return <VoucherPage />;
}
