import type { Metadata } from "next";

import { EditTypeProduct } from "@/features/type-product/components/edit-type-product";

export const metadata: Metadata = { title: "Ubah Tipe Produk" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTypeProduct id={id} />;
}
