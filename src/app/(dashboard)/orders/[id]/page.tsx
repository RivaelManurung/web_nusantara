import type { Metadata } from "next";

import { OrderDetailPage } from "@/features/order/components/order-detail-page";

export const metadata: Metadata = { title: "Detail Pesanan" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailPage orderId={id} />;
}
