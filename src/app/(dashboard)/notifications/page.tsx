import type { Metadata } from "next";

import { NotificationHistoryPage } from "@/features/notification/components/notification-history-page";

export const metadata: Metadata = { title: "Notifikasi" };

export default function Page() {
  return <NotificationHistoryPage />;
}
