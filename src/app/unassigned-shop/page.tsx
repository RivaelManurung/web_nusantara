import type { Metadata } from "next";

import { UnassignedShopPage } from "@/features/shop-context/components/unassigned-shop-page";

export const metadata: Metadata = { title: "Toko Belum Ditugaskan" };

export default function Page() {
  return <UnassignedShopPage />;
}
