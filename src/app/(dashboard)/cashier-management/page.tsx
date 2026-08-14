import type { Metadata } from "next";

import { CashierPage } from "@/features/cashier/components/cashier-page";

export const metadata: Metadata = { title: "Manajemen Kasir" };

export default function Page() {
  return <CashierPage />;
}
