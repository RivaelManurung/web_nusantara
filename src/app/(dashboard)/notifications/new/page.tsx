import type { Metadata } from "next";

import { NotificationPage } from "@/features/notification/components/notification-page";

export const metadata: Metadata = { title: "Buat Notifikasi" };

export default function Page() {
  return <NotificationPage />;
}
