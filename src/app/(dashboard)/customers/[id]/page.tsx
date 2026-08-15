import type { Metadata } from "next";

import { CustomerDetailPage } from "@/features/customer/components/customer-detail-page";

export const metadata: Metadata = { title: "Detail Pelanggan" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetailPage customerId={id} />;
}
