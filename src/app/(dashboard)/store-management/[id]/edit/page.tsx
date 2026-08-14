import type { Metadata } from "next";

import { EditShop } from "@/features/shop/components/edit-shop";

export const metadata: Metadata = { title: "Ubah Toko" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditShop id={id} />;
}
