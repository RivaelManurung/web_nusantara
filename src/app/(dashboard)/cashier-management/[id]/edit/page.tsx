import type { Metadata } from "next";

import { EditCashier } from "@/features/cashier/components/edit-cashier";

export const metadata: Metadata = { title: "Ubah Kasir" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCashier id={id} />;
}
