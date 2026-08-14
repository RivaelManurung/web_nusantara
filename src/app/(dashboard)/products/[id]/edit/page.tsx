import type { Metadata } from "next";

import { EditProduct } from "@/features/product/components/edit-product";

export const metadata: Metadata = { title: "Ubah Produk" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProduct id={id} />;
}
