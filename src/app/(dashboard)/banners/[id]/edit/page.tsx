import type { Metadata } from "next";

import { EditBanner } from "@/features/banner/components/edit-banner";

export const metadata: Metadata = { title: "Ubah Banner" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditBanner id={id} />;
}
