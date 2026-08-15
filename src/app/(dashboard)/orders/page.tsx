import type { Metadata } from "next";

import { OrderPage } from "@/features/order/components/order-page";

export const metadata: Metadata = { title: "Pesanan" };

export default function Page() {
  return <OrderPage />;
}
