import type { Metadata } from "next";

import { CustomerPage } from "@/features/customer/components/customer-page";

export const metadata: Metadata = { title: "Pelanggan" };

export default function Page() {
  return <CustomerPage />;
}
