import type { Metadata } from "next";

import { EditEvent } from "@/features/event/components/edit-event";

export const metadata: Metadata = { title: "Ubah Event" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditEvent id={id} />;
}
